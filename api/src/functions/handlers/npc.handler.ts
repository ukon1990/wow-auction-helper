import {DroppedItem, NPC, NPCUtil, VendorItem} from '../../utils/npc.util';
import {DatabaseUtil} from '../../utils/database.util';
import {ItemLocale} from '../../shared/models';
import {ApiResponse} from '../../models/api-response.model';
import {NPCQuery} from '../../queries/npc.query';
import {RDSQueryUtil} from '../../utils/query.util';

const PromiseThrottle: any = require('promise-throttle');

export class NpcHandler {
  static addNewNPCsByIds(ids: number[], db: DatabaseUtil): Promise<NPC[]> {
    return new Promise<NPC[]>((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 5,
        promiseImplementation: Promise
      });
      const promises = [];
      const progress = {
        processed: 0,
        length: ids.length
      };
      ids.forEach(id => {
        if (!id) {
          return;
        }
        promises.push(
          promiseThrottle.add(() => NPCUtil.getById(id, progress, db)));
      });
      Promise.all(promises)
        .then((npcs: NPC[]) => {
          resolve(npcs);
          // NPCUtil.insertEntriesIntoDB(npcs);
        })
        .catch(reject);
    });
  }

  static getAll(locale?: string, timestamp: string = new Date().toJSON()): Promise<ApiResponse<NPC>> {
    return new Promise<ApiResponse<NPC>>(async (resolve) => {
      const conn = new DatabaseUtil(false),
        result = {
          timestamp: timestamp,
          list: []
        },
        npcMap = {};
      await this.getAllNPCs(conn, npcMap, result, timestamp);
      if (result.list.length) {
        await this.getAllNPCNames(conn, npcMap, locale, timestamp);
        await this.getAllTags(conn, npcMap, locale, timestamp);
        await this.getAllCoordinates(conn, npcMap, timestamp);
        await this.getAllNPCDrops(conn, npcMap, timestamp);
        await this.getAllNPCSoldItems(conn, npcMap, timestamp);
      }
      conn.end();
      resolve(new ApiResponse<NPC>(result.timestamp, result.list, 'npcs'));
    });
  }

  static addNPCIfMissing(ids: number[], db: DatabaseUtil = new DatabaseUtil()): Promise<NPC[]> {

    return new Promise<NPC[]>(async (resolve, reject) => {
      if (!ids.length) {
        resolve();
        return;
      }
      console.log('First npc:', ids[0]);

      await db.query(`SELECT id FROM npc WHERE id not in (${ids.join(',')})`)
        .then(async (newIds: { id: number }[]) => {
          let result = [];
          if (newIds && newIds.length) {
            console.log(`Adding ${newIds.length} new NPCs to the DB`);
            result = await this.addNewNPCsByIds(newIds.map(({id}) => id), db);
          }
          resolve(result);
        })
        .catch(() => {
          resolve();
        });
    });
  }

  private static async getAllNPCSoldItems(conn: DatabaseUtil, npcMap: {}, timestamp: string) {
    await conn.query(`SELECT id, npcId, standing, stock, price, unitPrice, stackSize, currency
                            FROM npcSells
                            WHERE npcId IN (
                                select id from npc where ${RDSQueryUtil.unixTimestamp(timestamp)}
                            );`)
      .then((list: any[]) => {
        list.forEach(({id, npcId, standing, stock, price, unitPrice, stackSize, currency}) => {
          if (!npcMap[npcId]) {
            return;
          }
          if (!npcMap[npcId]['sells']) {
            npcMap[npcId]['sells'] = [];
          }
          npcMap[npcId]['sells'].push({
            id, standing, stock, price, unitPrice, stackSize, currency
          });
        });
      });
  }

  private static async getAllNPCDrops(conn: DatabaseUtil, npcMap: {}, timestamp: string) {
    await conn.query(`SELECT id, npcId, dropChance
                            FROM npcDrops
                            WHERE npcId in (
                                select id from npc where ${RDSQueryUtil.unixTimestamp(timestamp)}
                            );`)
      .then((list: any[]) => {
        list.forEach(({id, npcId, dropChance}) => {
          if (!npcMap[npcId]) {
            return;
          }
          if (!npcMap[npcId]['drops']) {
            npcMap[npcId]['drops'] = [];
          }
          npcMap[npcId]['drops'].push({
            id,
            dropChance: +(dropChance).toFixed(3),
          });
        });
      });
  }

  private static async getAllCoordinates(conn: DatabaseUtil, npcMap: {}, timestamp: string) {
    await conn.query(`SELECT id, x, y
                            FROM npcCoordinates
                            WHERE id in (
                                select id from npc where ${RDSQueryUtil.unixTimestamp(timestamp)}
                            );`)
      .then((list: any[]) => {
        list.forEach(({id, x, y}) => {
          if (!npcMap[id]['coordinates']) {
            npcMap[id]['coordinates'] = [];
          }
          npcMap[id]['coordinates'].push({x, y});
        });
      });
  }

  private static async getAllTags(conn: DatabaseUtil, npcMap: {}, locale: string, timestamp: string) {
    await conn.query(`SELECT * FROM npcTag WHERE id in (select id from npc where ${RDSQueryUtil.unixTimestamp(timestamp)});`)
      .then((list: any[]) => {
        list.forEach(row => {
          npcMap[row.id]['tag'] = locale ? row[locale] : row;
          delete row.id;
        });
      });
  }

  private static async getAllNPCNames(conn: DatabaseUtil, npcMap: {}, locale: string, timestamp: string) {
    await conn.query(`SELECT * FROM npcName WHERE id in (select id from npc where ${RDSQueryUtil.unixTimestamp(timestamp)});`)
      .then((list: any[]) => {
        list.forEach(row => {
          npcMap[row.id]['name'] = locale ? row[locale] : row;
          delete row.id;
        });
      });
  }

  private static async getAllNPCs(conn: DatabaseUtil, npcMap: {}, result, timestamp: string) {
    console.log(`SELECT * FROM npc WHERE ${RDSQueryUtil.unixTimestamp(timestamp)} ORDER BY timestamp desc;`);
    await conn.query(NPCQuery.getAllAfterTimestamp(timestamp))
      .then((list) => {
        result.timestamp = list[0] ? list[0].timestamp : timestamp;
        list.forEach(row => {
          npcMap[row.id] = row;
          result.list.push(row);
          // delete row.timestamp;
        });
      })
      .catch(console.error);
  }

  private static async getAllNPCsLeftOuterJoin(conn: DatabaseUtil, npcMap: {}, result, timestamp: string) {
    await conn.query(NPCQuery.getAllJoinedAfterTimestamp(timestamp))
      .then((list) => {
        result.timestamp = list[0].timestamp;
        list.forEach(row => {
          const npc: NPC = this.setNPCBaseValues(npcMap[row.id], row, npcMap, result.list);
          if (row.x && row.y) {
            npc.coordinates.push({x: row.x, y: row.y});
          }

          if (row.dropId) {
            const item = new DroppedItem();
            item.id = row.dropId;
            item.dropped = row.dropped;
            item.outOf = row.outOf;
            item.dropChance = row.dropChance;
            npc.drops.push(item);
          }

          if (row.sellId) {
            const item = new VendorItem();
            item.id = row.sellId;
            item.stackSize = row.stackSize;
            item.price = row.price;
            item.currency = row.currency;
            item.unitPrice = row.unitPrice;
            item.stock = row.stock;
            npc.sells.push(item);
          }
          delete row.timestamp;
        });
      })
      .catch(console.error);
  }

  private static setNPCBaseValues(npc, row, npcMap: {}, list: any[]) {
    if (!npc) {
      npc = new NPC(row.id);
      npc.isAlliance = row.isAlliance;
      npc.isHorde = row.isHorde;
      npc.minLevel = row.minLevel;
      npc.maxLevel = row.maxLevel;
      npc.name = row.name;
      npc.tag = row.tag;
      npc.zoneId = row.zoneId;
      npc.expansionId = row.expansionId;
      npc.sells = [];
      npc.drops = [];
      npc.coordinates = [];
      npcMap[row.id] = npc;
      list.push(npc);
    }
    return npc;
  }

  /* Fetching NPC from DB if exists */
  static getById(id: number, locale?: string): Promise<NPC> {
    return new Promise<NPC>((resolve, reject) => {
      const conn = new DatabaseUtil(false);
      conn.query(`SELECT * FROM npc WHERE id = ${id}`)
        .then(async result => {
          if (result && result[0]) {
            const npc = await this.processNpcData(id, result[0], locale, conn);
            resolve(npc);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  private static async processNpcData(id: number, res, locale: string, conn: DatabaseUtil) {
    const npc: NPC = new NPC(id);
    npc.zoneId = res.zoneId;
    npc.isAlliance = res.isAlliance === 1;
    npc.isHorde = res.isHorde === 1;
    npc.minLevel = res.minLevel;
    npc.maxLevel = res.maxLevel;
    npc.expansionId = res.expansionId;
    await this.getNameForNpc(id, npc, locale, conn);
    await this.getTagForNpc(id, npc, locale, conn);
    await this.getDropsForNpc(id, npc, conn);
    await this.getSellsForNpc(id, npc, conn);
    await conn.query(`select * from npcCoordinates where id = ${id}`)
      .then(sellerResult => {
        if (sellerResult) {
          npc.coordinates = sellerResult.map(coords => {
            delete coords.id;
            delete coords.timestamp;
            return coords;
          });
        }
      })
      .catch(() => npc.coordinates = []);
    conn.end();
    return npc;
  }

  private static async getSellsForNpc(id: number, npc: NPC, conn: DatabaseUtil) {
    await conn.query(`select * from npcSells where npcId = ${id}`)
      .then(sellerResult => {
        if (sellerResult) {
          npc.sells = sellerResult.map(item => {
            delete item.npcId;
            delete item.timestamp;
            return item;
          });
        }
      })
      .catch((error) => {
        npc.sells = [];
        console.error(error);
      });
  }

  private static async getNameForNpc(id: number, npc: NPC, locale: string, conn: DatabaseUtil) {
    await conn.query(`select * from npcName where id = ${id}`)
      .then((name: ItemLocale) => {
        delete name[0].id;
        npc.name = locale ? name[0][locale] : name[0];
      })
      .catch(console.error);
  }

  private static async getTagForNpc(id: number, npc: NPC, locale: string, conn: DatabaseUtil) {
    await conn.query(`select * from npcTag where id = ${id}`)
      .then((tag: ItemLocale) => {
        if (tag && tag[0]) {
          delete tag[0].id;
          npc.tag = locale ? tag[0][locale] : tag[0];
        }
      })
      .catch(console.error);
  }

  private static async getDropsForNpc(id: number, npc: NPC, conn: DatabaseUtil) {
    await conn.query(`select * from npcDrops where npcId = ${id}`)
      .then(dropResult => {
        if (dropResult) {
          npc.drops = dropResult.map(item => {
            delete item.npcId;
            delete item.timestamp;
            return item;
          });
        }
      })
      .catch((error) => {
        npc.drops = [];
        console.error(error);
      });
  }
}