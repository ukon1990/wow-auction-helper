import {NPC, NPCUtil} from '../utils/npc.util';
import {DatabaseUtil} from '../utils/database.util';
import {ItemLocale} from '../models/item/item-locale';
import {ApiResponse} from '../models/api-response.model';

const PromiseThrottle: any = require('promise-throttle');

export class NpcHandler {
  static addNewNPCsByIds(ids: number[]): Promise<NPC[]> {
    return new Promise<NPC[]>((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 10,
        promiseImplementation: Promise
      });
      const promises = [];
      const progress = {
        processed: 0,
        length: ids.length
      };
      ids.forEach(id => promises.push(
        promiseThrottle.add(() => NPCUtil.getById(id, progress))));
      Promise.all(promises)
        .then((npcs: NPC[]) => {
          resolve(npcs);
          // NPCUtil.insertEntriesIntoDB(npcs);
        })
        .catch(reject);
    });
  }

  static getAll(locale?: string, timestamp: string = new Date().toJSON()): Promise<ApiResponse<NPC>> {
    return new Promise<ApiResponse<NPC>>(async (resolve, reject) => {
      const conn = new DatabaseUtil(false),
        result = {
          timestamp: timestamp,
          list: []
        },
        npcMap = {};
      await this.getAllNPCs(conn, npcMap, result, timestamp);
      if (result.list.length) {
        await this.getAllNPCNames(conn, npcMap, locale);
        await this.getAllTags(conn, npcMap, locale);
        await this.getAllCoordinates(conn, npcMap);
        await this.getAllNPCDrops(conn, npcMap);
        await this.getAllNPCSoldItems(conn, npcMap);
      }
      conn.end();
      resolve(new ApiResponse<NPC>(result.timestamp, result.list, 'npcs'));
    });
  }

  static addNPCIfMissing(ids: number[]): Promise<NPC[]> {

    return new Promise<NPC[]>(async (resolve, reject) => {
      await new DatabaseUtil().query(`SELECT id FROM npc WHERE id not in (${ids.join(',')})`)
        .then(async (newIds: number[]) => {
          let result = [];
          if (newIds && newIds.length) {
            console.log(`Adding ${newIds.length} new NPCs to the DB`);
            result = await this.addNewNPCsByIds(newIds);
          }
          resolve(result);
        })
        .catch(() => {
        });
    });
  }

  private static async getAllNPCSoldItems(conn: DatabaseUtil, npcMap: {}) {
    await conn.query(`SELECT * FROM npcSells`)
      .then((list: any[]) => {
        list.forEach(row => {
          if (!npcMap[row.npcId]) {
            return;
          }
          delete row.timestamp;
          if (!npcMap[row.npcId]['sells']) {
            npcMap[row.npcId]['sells'] = [];
          }
          npcMap[row.npcId]['sells'].push(row);
          delete row.npcId;
        });
      });
  }

  private static async getAllNPCDrops(conn: DatabaseUtil, npcMap: {}) {
    await conn.query(`SELECT * FROM npcDrops`)
      .then((list: any[]) => {
        list.forEach(row => {
          if (!npcMap[row.npcId]) {
            return;
          }
          delete row.timestamp;
          if (!npcMap[row.npcId]['drops']) {
            npcMap[row.npcId]['drops'] = [];
          }
          npcMap[row.npcId]['drops'].push(row);
          delete row.npcId;
        });
      });
  }

  private static async getAllCoordinates(conn: DatabaseUtil, npcMap: {}) {
    await conn.query(`SELECT * FROM npcCoordinates`)
      .then((list: any[]) => {
        list.forEach(row => {
          delete row.timestamp;
          if (!npcMap[row.id]['coordinates']) {
            npcMap[row.id]['coordinates'] = [];
          }
          npcMap[row.id]['coordinates'].push(row);
          delete row.id;
        });
      });
  }

  private static async getAllTags(conn: DatabaseUtil, npcMap: {}, locale: string) {
    await conn.query(`SELECT * FROM npcTag`)
      .then((list: any[]) => {
        list.forEach(row => {
          npcMap[row.id]['tag'] = locale ? row[locale] : row;
          delete row.id;
        });
      });
  }

  private static async getAllNPCNames(conn: DatabaseUtil, npcMap: {}, locale: string) {
    await conn.query(`SELECT * FROM npcName`)
      .then((list: any[]) => {
        list.forEach(row => {
          npcMap[row.id]['name'] = locale ? row[locale] : row;
          delete row.id;
        });
      });
  }

  private static async getAllNPCs(conn: DatabaseUtil, npcMap: {}, result, timestamp: string) {
    await conn.query(`SELECT * FROM npc WHERE timestamp > ${timestamp};`)
      .then((list) => {
        list.forEach(row => {
          npcMap[row.id] = row;
          result.list.push(row);
          if (!result.timestamp || +new Date(result.timestamp) < +new Date(result.timestamp)) {
            result.timestamp = row.timestamp;
          }
          delete row.timestamp;
        });
      });
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
      .catch(() => npc.sells = []);
  }

  private static async getNameForNpc(id: number, npc: NPC, locale: string, conn: DatabaseUtil) {
    await conn.query(`select * from npcName where id = ${id}`)
      .then((name: ItemLocale) => {
        delete name[0].id;
        npc.name = locale ? name[0][locale] : name[0];
      });
  }

  private static async getTagForNpc(id: number, npc: NPC, locale: string, conn: DatabaseUtil) {
    await conn.query(`select * from npcTag where id = ${id}`)
      .then((tag: ItemLocale) => {
        if (tag && tag[0]) {
          delete tag[0].id;
          npc.tag = locale ? tag[0][locale] : tag[0];
        }
      });
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
      .catch(() => npc.drops = []);
  }
}
