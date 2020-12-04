import {DatabaseUtil} from '../utils/database.util';
import {ZoneUtil} from '../utils/zone.util';
import {RDSQueryUtil} from '../utils/query.util';
import {LocaleUtil} from '../utils/locale.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {NPC} from './model';
import {NPCUtil} from './util';

export class NPCRepository {
  constructor(private db: DatabaseUtil, private locale: string = 'en_GB') {
  }

  getAllFromLatestExpansionFromItems(): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      this.db.query(`
          SELECT id,
                 itemSource
          FROM items
          WHERE expansionId = 8
            AND (itemSource NOT LIKE '%"droppedBy":[]%'
              OR itemSource NOT LIKE '%"soldBy":[]%');
      `)
        .then(rows => resolve(new NPCUtil().getIdsFromItems(rows)))
        .catch(reject);
    });
  }

  insertOrUpdate(npc: NPC): Promise<NPC> {
    return new Promise<NPC>(async (resolve, reject) => {
      // Need to add the zone if it is missing
      if (!npc.zoneId) {
        reject({message: `NPC(${npc.id}) is missing zone ID.`});
        return;
      }
      await ZoneUtil.getById(npc.zoneId, undefined, this.db)
        .then(() => {
          this.insertNpcIntoDB(npc)
            .then(async () => {
              Promise.all([
                this.insertNameIntoDB(npc).catch(console.error),
                this.insertTagIntoDB(npc).catch(console.error),
                this.insertCoordsIntoDB(npc).catch(console.error),
                this.insertSourceValuesIntoDB(npc.id, npc.sells, 'npcSells').catch(console.error),
                this.insertSourceValuesIntoDB(npc.id, npc.drops, 'npcDrops').catch(console.error),
                this.insertSourceValuesIntoDB(npc.id, npc.skinning, 'npcSkins').catch(console.error),
              ])
                .then(() => resolve(npc))
                .catch(() => resolve(npc));
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // Not sure if I'm going to make it return a full object as it's not going to be exposed
  getById(id: number): Promise<NPC> {
    return new Promise<NPC>(((resolve, reject) => {
      this.db.query(`
          SELECT *
          FROM npc
          WHERE id = ${id};
      `)
        .then(async (rows: NPC[]) => {
          resolve(rows[0]);
        })
        .catch(reject);
    }));
  }

  getAll(): Promise<NPC[]> {
    return new Promise<NPC[]>(((resolve, reject) => {
      this.db.query(`
          SELECT *
          FROM npc
          ORDER BY timestamp desc;
      `)
        .then(async (rows: NPC[]) => {
          const list: NPC[] = [];
          const map = new Map<number, NPC>();
          rows.forEach(npc => {
            map.set(npc.id, npc);
            list.push(npc);
          });
          await Promise.all([
            this.getAllNamesOrTags(map, 'Name'),
            this.getAllNamesOrTags(map, 'Tag'),
            this.getAllCoordinates(map),
            this.getAllDropsOrSkins(map, 'Drops'),
            this.getAllDropsOrSkins(map, 'Skins'),
            this.getAllSells(map),
          ])
            .then(() => {
              resolve(list);
            })
            .catch(reject);
        })
        .catch(reject);
    }));
  }

  private insertNpcIntoDB(npc: NPC) {
    return new Promise<any>((resolve, reject) => {
      const sql = new RDSQueryUtil('npc').insertOrUpdate({
        id: npc.id,
        isAlliance: npc.isAlliance,
        isHorde: npc.isHorde,
        minLevel: npc.minLevel,
        maxLevel: npc.maxLevel,
        zoneId: npc.zoneId,
        expansionId: npc.expansionId,
        patch: npc.patch
      }, true);

      this.db.query(sql)
        .then(resolve)
        .catch((e) => {
          this.loggIfNotDuplicateError(e, sql);
          if (!this.isDuplicateError(e)) {
            reject(e);
            return;
          }
          resolve(npc);
        });
    });
  }

  private async insertSourceValuesIntoDB(npcId, list: any[], table: string) {
    const mappedList = list.map(npc => ({
      npcId,
      ...npc
    }));
    if (!mappedList.length) {
      return;
    }
    const sql = new RDSQueryUtil(table).multiInsertOrUpdate(mappedList, true);
    await this.db.query(sql)
      .catch(e => {
        console.log(e);
        this.loggIfNotDuplicateError(e, sql);
      });
  }

  private async insertCoordsIntoDB(npc: NPC) {
    const coordinates = npc.coordinates.map(coords => ({
      id: npc.id,
      ...coords
    }));
    const sql = new RDSQueryUtil('npcCoordinates').multiInsertOrUpdate(coordinates, true);
    try {
      await this.db.query(sql);
      await this.db.query(new RDSQueryUtil('npc').update(npc.id, {id: npc.id}));
    } catch (e) {
      this.loggIfNotDuplicateError(e, sql);
    }
  }

  private async insertNameIntoDB(npc: NPC) {
    return new Promise((resolve, reject) => {
      try {
        if (Object.keys(npc.name).filter(k => npc.name[k] === undefined).length > 0) {
          resolve();
          return;
        }
        LocaleUtil.insertToDB('npcName', 'id', npc.name, this.db)
          .then(resolve)
          .catch(reject);
      } catch (e) {
        resolve();
      }
    });
  }

  private async insertTagIntoDB(npc: NPC) {
    return new Promise((resolve, reject) => {
      try {
        if (npc.tag && npc.tag.en_GB) {
          LocaleUtil.insertToDB('npcTag', 'id', npc.tag, this.db)
            .then(resolve)
            .catch(reject);
        } else {
          resolve();
        }
      } catch (e) {
        resolve();
      }
    });
  }

  private getAllNamesOrTags(map: Map<number, NPC>, type: string): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.db.query(`
            SELECT id, ${this.locale} as name
            FROM npc${type}
            WHERE id in (select id from npc);`)
        .then((rows: any[]) =>
          rows.forEach(row => map.get(row.id)[type.toLowerCase()] = row.name))
        .catch(reject);
    }));
  }

  private getAllCoordinates(map: Map<number, NPC>): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.db.query(`SELECT id, x, y
                     FROM npcCoordinates
                     WHERE id in (
                         select id
                         from npc
                     );`)
        .then((rows: any[]) => {
          rows.forEach(({id, x, y}) => {
            if (!map.get(id).coordinates) {
              map.get(id).coordinates = [];
            }
            map.get(id).coordinates.push({x, y});
          });
          resolve();
        })
        .catch(reject);
    }));
  }

  private getAllDropsOrSkins(map: Map<number, NPC>, type: string): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.db.query(`SELECT id, npcId, dropChance
                            FROM npc${type}
                            WHERE id in (
                                select id from npc
                            );`)
        .then((rows: any[]) => {
          rows.forEach(({id, npcId, dropChance}) => {
            if (!map.get(npcId)[type.toLowerCase()]) {
              map.get(npcId)[type.toLowerCase()] = [];
            }
            map.get(npcId)[type.toLowerCase()].push({
              id,
              dropChance: +(dropChance).toFixed(3)
            });
          });
          resolve();
        })
        .catch(reject);
    }));
  }

  private getAllSells(map: Map<number, NPC>): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.db.query(`SELECT id,
                            npcId,
                            standing,
                            stock,
                            price,
                            unitPrice,
                            stackSize,
                            currency
                     FROM npcSells
                     WHERE id in (
                         select id
                         from npc
                     );`)
        .then((rows: any[]) => {
          rows.forEach(({id, npcId, standing, stock, price, unitPrice, stackSize, currency}) => {
            if (!map.get(npcId).sells) {
              map.get(npcId).sells = [];
            }
            map.get(npcId).sells.push({
              id, standing, stock, price, unitPrice, stackSize, currency
            });
          });
          resolve();
        })
        .catch(reject);
    }));
  }


  private loggIfNotDuplicateError(e, sql: string) {
    if (!this.isDuplicateError(e)) {
      console.error('Failed with: ' + sql, e);
    }
  }

  private isDuplicateError(e) {
    return TextUtil.contains(e.error, 'ER_DUP_ENTRY');
  }

  getAllIds(): Promise<Map<number, number>> {
    const map = new Map<number, number>();

    return new Promise<Map<number, number>>((resolve, reject) => {
      this.db.query(`
          SELECT id
          FROM npc
          WHERE expansionId = 8;
      `)
        .then((ids: {id}[]) => {
          ids.forEach(({id}) => {
            map.set(id, id);
          });
          resolve(map);
        })
        .catch(reject);
    });
  }
}
