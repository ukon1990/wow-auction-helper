import {HttpClientUtil} from './http-client.util';
import {languages} from '../static-data/language.data';
import {Language} from '../models/language.model';
import {ItemLocale} from '../models/item/item-locale';
import {WoWHeadUtil} from './wowhead.util';
import {QueryUtil} from './query.util';
import {DatabaseUtil} from './database.util';
import {LocaleUtil} from './locale.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {ItemHandler} from '../handlers/item.handler';
import {ZoneUtil} from './zone.util';

const PromiseThrottle: any = require('promise-throttle');

export interface Coordinates {
  x: number;
  y: number;
}

export interface Map {
  zoneId: number;
  coordinates: Coordinates[];
}

export class VendorItem {
  id: number;
  price: number;
  unitPrice: number;
  currency: number;
  stock: number;
  stackSize: number;

  static setFromBody(body: string): VendorItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'sells')
      .map(({id, standing, stack, cost, avail}) => {
        let price = cost[0];
        let currency: number;
        const cost1 = cost[1], cost2 = cost[2];
        try {
          if (cost2 && cost2[0] && cost2[0].length >= 2) {
            const c = cost2[0];
            price = c && c[1] || 1;
            currency = c && c[0] || 1;
          } else if (cost1 && cost1[0] && cost1[0].length >= 2) {
            const c = cost1[0];
            price = c && c[1] || 1;
            currency = c && c[0] || 1;
          } else if (cost && cost.length === 1) {
            price = cost[0];
          }
        } catch (e) {
          console.error('NPCUtil.setFromBody: cost', cost,  e);
        }
        return {
          id,
          standing,
          stock: avail,
          price,
          unitPrice: price / stack[0],
          currency,
          stackSize: stack[0]
        };
      });
  }
}

export class DroppedItem {
  id: number;
  dropped: number;
  outOf: number;
  dropChance: number;

  static setFromBody(body: string): DroppedItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'drops').map(({id, modes}) => ({
      id,
      dropped: modes[1].count,
      outOf: modes[1].outof,
      dropChance: modes[1].count / modes[1].outof
    }) as DroppedItem);
  }
}

export class SkinnedItem {
  id: number;
  count: number;
  dropChance: number;

  static setFromBody(body: string): SkinnedItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'skinning')
      .map(({id, pctstack, count, totalCount}) => {/*
        let dropChance = 0;
        console.log(pctstack);
        try {
          if (pctstack) {
            // tslint:disable-next-line:no-eval
            const stackChance = eval(pctstack);
            Object.keys(stackChance)
              .forEach(size => dropChance += stackChance[size]);
            console.log(stackChance, dropChance);
          }
        } catch (e) {
        }*/
        return {
          id,
          count,
          totalCount,
          dropChance: count / totalCount
        };
      });
  }
}

export class NPC {
  name: ItemLocale = new ItemLocale();
  tooltip: string;
  zoneId: number;
  coordinates: Coordinates[] = [];
  completion_category: number;
  sells: VendorItem[] = [];
  drops: DroppedItem[] = [];
  skinning: SkinnedItem[] = [];
  expansionId?: number;
  isAlliance: boolean;
  isHorde: boolean;
  minLevel?: number;
  maxLevel?: number;
  tag: ItemLocale = new ItemLocale();
  type: number;
  classification: number;
  avgGoldDrop: number; // Can not be used reliably as raw gold dropped.
  patch: string;

  constructor(public id: number) {
    this.name.id = id;
    this.tag.id = id;
  }

  setData?({name, tooltip, map}: { name: string, tooltip: string, map: any }, language: Language): NPC {
    language.locales.forEach(locale => {
      this.setName(name, locale);
    });

    if (language.key === 'en') {
      this.setTooltipData(tooltip);
      if (map && map.zone) {
        this.zoneId = map.zone;
      }
      if (map && map.coords) {
        Object.keys(map.coords).forEach(k => {
          const list = map.coords[k].map(coords => ({
            x: coords[0],
            y: coords[1]
          }));
          this.coordinates = [...this.coordinates, ...list];
        });
      }
    }
    return this;
  }

  setFromWowHead?(body: string, language: Language) {
    const regex = new RegExp(`(g_npcs\\[${this.id}\\],[\\n\\r ]{0,}\\{[\\s\\S]*?(\\);)$){1,}`, 'gm');
    const regexResult = regex.exec(body);
    if (regexResult && regexResult.length) {
      const resString = regexResult[0]
        .replace(new RegExp(`g_npcs\\[${this.id}\\], `, 'gm'), '')
        .replace(/(\);)$/gm, '');
      try {
        const {maxlevel, minlevel, react, tag, classification, type} = JSON.parse(`${resString}`);
        language.locales.forEach(locale => {
          this.tag[locale] = tag;
        });

        if (language.key === 'en') {
          this.minLevel = minlevel;
          this.maxLevel = maxlevel;
          if (react && react.length) {
            this.isAlliance = react[0] === 1;
            this.isHorde = react[1] === 1;
          } else {
            this.isAlliance = false;
            this.isHorde = false;
          }

          if (type !== undefined) {
            this.type = type;
          }

          if (classification !== undefined) {
            this.classification = classification;
          }
        }
      } catch (e) {
        if (language.key === 'en') {
          console.error(resString, e);
        }
      }
    }

    if (language.key === 'en') {
      const patchAndExpansion = WoWHeadUtil.getExpansion(body);
      this.expansionId = patchAndExpansion.expansionId;
      this.patch = patchAndExpansion.patch;
      this.avgGoldDrop = this.getGoldDrop(body);
      this.drops = DroppedItem.setFromBody(body);
      this.sells = VendorItem.setFromBody(body);
      this.skinning = SkinnedItem.setFromBody(body);
    }
  }

  private setName?(name: string, locale = 'en_GB'): void {
    this.name[locale] = name;
  }

  private setTooltipData?(tooltip: string): void {
  }

  private getGoldDrop?(body: string): number {
    const goldRegex = /money=[\d]{1,}/gm,
      goldResult = goldRegex.exec(body);
    if (goldResult && goldResult[0]) {
      return +goldResult[0]
        .replace(/money=/, '');
    }
    return 0;
  }
}

export class NPCUtil {
  private static ignoreItemIds = {};

  // 86777,87202,87204,86776,86778,86683,87203,87201
  static getById(id: number, progress?: { processed: number, length: number }) {
    return new Promise<NPC>((resolve, reject) => {
      const npc: NPC = new NPC(id),
        promises: Promise<any>[] = [];

      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: languages.length,
        promiseImplementation: Promise
      });
      languages
        .forEach(lang => promises.push(
          promiseThrottle.add(() => this.getNpcDataWithLocale(id, lang, npc))));
      Promise.all(promises)
        .then(() => {
          if (progress) {
            progress.processed++;
            console.log(`NPC fetch progress: ${
              Math.round((progress.processed / progress.length) * 100)}% (${
              progress.processed} of ${progress.length}) - ${npc.name.en_GB}`);
          }
          resolve(npc);
          this.insertNPCIntoDB(npc)
            .then(() => {
              // console.log(`Added ${npc.name.en_GB} to db`);
            })
            .catch(console.error);
        })
        .catch((error) => {
          this.addErrorToProgress(progress, 'Not found');
          reject(error);
        });
    });
  }

  static updateMissingLocale(): Promise<ItemLocale[]> {
    return new Promise<ItemLocale[]>(async (resolve, reject) => {
      const conn = new DatabaseUtil(false);
      let updateIds, insertIds;
      const locales: ItemLocale[] = [],
        promises = [];
      try {
        updateIds = await conn.query(
            `SELECT id
                  FROM npcName
                  WHERE
                    en_GB LIKE '%undefined%' OR
                    fr_FR LIKE '%undefined%' OR
                    es_ES LIKE '%undefined%' OR
                    de_DE LIKE '%undefined%' OR
                    it_IT LIKE '%undefined%' OR
                    pt_PT LIKE '%undefined%' OR
                    ru_RU LIKE '%undefined%' OR
                    ko_KR LIKE '%undefined%' OR
                    zh_TW LIKE '%undefined%';`);
      } catch (e) {
        console.error(e);
      }

      try {
        insertIds = await conn.query(
            `SELECT id FROM npc WHERE id NOT IN (SELECT id FROM npcName);`);
      } catch (e) {

      }
      let count = 0;
      const sum = updateIds.length + insertIds.length;
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 10,
        promiseImplementation: Promise
      });
      updateIds
        .forEach(row => promises.push(
          promiseThrottle.add(async () => {
            await this.getLocaleForId(row.id)
              .then(async locale => {
                locales.push(locale);
                await conn.query(new QueryUtil('npcName', false).update(row.id, locale));
                await conn.query(new QueryUtil('npc').update(row.id, {id: row.id}));
              })
              .catch(console.error);
            count++;
            console.log(`Updated ${count} of ${sum} (${row.id})`, locales[locales.length - 1].en_GB);
          })));
      insertIds
        .forEach(row => promises.push(
          promiseThrottle.add(async () => {
            await this.getLocaleForId(row.id)
              .then(async locale => {
                locales.push(locale);
                await conn.query(new QueryUtil('npcName', false).insert(locale));
                await conn.query(new QueryUtil('npc').update(row.id, {id: row.id}));
              })
              .catch(console.error);
            count++;
            console.log(`Updated ${count} of ${sum} (${row.id})`, locales[locales.length - 1].en_GB);
          })));
      await Promise.all(promises)
        .then(() => {
          resolve(locales);
          conn.end();
        }).catch(reject);

    });
  }

  private static getLocaleForId(id: number): Promise<ItemLocale> {
    return new Promise<ItemLocale>((resolve, reject) => {
      const locale: ItemLocale = new ItemLocale(id),
        promises: Promise<any>[] = [];

      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: languages.length,
        promiseImplementation: Promise
      });
      languages
        .forEach(lang => promises.push(
          promiseThrottle.add(() => {
            return new Promise<ItemLocale>((res, rej) => {
              new HttpClientUtil().get(
                `https://www.wowhead.com/tooltip/npc/${id}?locale=${lang.key}`, true)
                .then(({body}) => {
                  if (body && body.name) {
                    lang.locales.forEach(loc => locale[loc] = body.name);
                  }
                  res();
                })
                .catch(res);
            });
          })));
      Promise.all(promises)
        .then(() => resolve(locale))
        .catch(reject);
    });
  }

  private static addErrorToProgress(progress: { processed: number; length: number }, msg: string) {
    if (progress) {
      progress.processed++;
      console.log(`NPC fetch progress: ${
        Math.round((progress.processed / progress.length) * 100)}% (${progress.processed} of ${progress.length}) - Error: ${msg}`);
    }
  }

  private static getNpcDataWithLocale(id: number, language: Language, npc: NPC) {
    return new Promise<NPC>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/tooltip/npc/${id}?locale=${language.key}`, true)
        .then(async ({body}) => {
          try {
            await this.getHtmlAndSetNPCData(id, npc, language);
            resolve(npc.setData(body, language));
          } catch (e) {
            console.error(e);
            resolve(npc);
          }
        })
        .catch((error) => {
          console.error({
            id,
            error
          });
          resolve(undefined);
        });
    });
  }

  private static getHtmlAndSetNPCData(id: number, npc: NPC, language: Language) {
    return new Promise<any>((resolve, reject) => {
      const urlPrefix = language.key === 'en' ? 'www' : language.key;
      new HttpClientUtil().get(`https://${urlPrefix}.wowhead.com/npc=${id}`, false)
        .then(({body}) => {
          npc.setFromWowHead(body, language);
          resolve(npc);
        })
        .catch(reject);
    });
  }

  static insertEntriesIntoDB(npcs: NPC[]): Promise<NPC[]> {
    return new Promise<NPC[]>((resolve, reject) => {
      const promises = [];
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      npcs.forEach(npc => promises.push(
        promiseThrottle.add(() => this.insertNPCIntoDB(npc))));
      Promise.all(promises)
        .then(() => console.log('Success!'))
        .catch((error) => {
          console.error(error);
        });
      resolve(npcs);
    });
  }

  private static async insertNPCIntoDB(npc: NPC) {
    return new Promise<NPC>(async (resolve, reject) => {
      // Need to add the zone if it is missing
      await ZoneUtil.getById(npc.zoneId);
      const conn = new DatabaseUtil(false);
      this.insertNpcIntoDB(npc, conn)
        .then(async () => {
          await this.insertNameIntoDB(npc).catch(console.error);
          await this.insertTagIntoDB(npc).catch(console.error);
          await this.insertCoordsIntoDB(npc, conn).catch(console.error);
          await this.insertSellsIntoDB(npc, conn).catch(console.error);
          await this.insertDropsIntoDB(npc, conn).catch(console.error);
          conn.end();

          resolve(npc);
        })
        .catch((error) => {
          conn.end();
          reject(error);
        });
    });
  }

  private static insertNpcIntoDB(npc: NPC, conn: DatabaseUtil) {
    return new Promise<any>((resolve, reject) => {
      const sql = new QueryUtil('npc').insert({
        id: npc.id,
        isAlliance: npc.isAlliance,
        isHorde: npc.isHorde,
        minLevel: npc.minLevel,
        maxLevel: npc.maxLevel,
        zoneId: npc.zoneId,
        expansionId: npc.expansionId,
        patch: npc.patch
      });
      conn.query(sql)
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

  private static async insertDropsIntoDB(npc: NPC, conn: DatabaseUtil) {
    for (const drops of npc.drops) {
      const sql = new QueryUtil('npcDrops').insert({
        npcId: npc.id,
        ...drops
      });
      try {
        await conn.query(sql);
        await conn.query(new QueryUtil('npc').update(npc.id, {id: npc.id}));
      } catch (e) {
        this.loggIfNotDuplicateError(e, sql);
      }
    }
  }

  private static async insertSellsIntoDB(npc: NPC, conn: DatabaseUtil) {
    for (const sells of npc.sells) {
      const sql = new QueryUtil('npcSells').insert({
        npcId: npc.id,
        ...sells
      });
      try {
        await conn.query(sql);
        await conn.query(new QueryUtil('npc').update(npc.id, {id: npc.id}));
      } catch (e) {
        console.log(e);
        this.loggIfNotDuplicateError(e, sql);
      }
    }
  }

  private static addItemIfMissing({error}, {id}: VendorItem | DroppedItem) {
    if (TextUtil.contains(error, '`items` (`id`)')) {
      this.ignoreItemIds[id] = true;
      /*
      new ItemHandler().getById(id, 'en_GB')
        .then(() => console.log('Item added?'))
        .catch(console.error);*/
    }
  }

  private static async insertCoordsIntoDB(npc: NPC, conn: DatabaseUtil) {
    for (const coords of npc.coordinates) {
      const sql = new QueryUtil('npcCoordinates').insert({
        id: npc.id,
        ...coords
      });
      try {
        await conn.query(sql);
        await conn.query(new QueryUtil('npc').update(npc.id, {id: npc.id}));
      } catch (e) {
        this.loggIfNotDuplicateError(e, sql);
      }
    }
  }

  private static async insertNameIntoDB(npc: NPC) {
    try {
      if (Object.keys(npc.name).filter(k => npc.name[k] === undefined).length > 0) {
        return;
      }
      await LocaleUtil.insertToDB('npcName', 'id', npc.name);
    } catch (e) {
    }
  }

  private static async insertTagIntoDB(npc: NPC) {
    if (npc.tag && npc.tag.en_GB) {
      try {
        await LocaleUtil.insertToDB('npcTag', 'id', npc.tag);
      } catch (e) {
      }
    }
  }

  private static loggIfNotDuplicateError(e, sql: string) {
    if (!this.isDuplicateError(e)) {
      console.error('Failed with: ' + sql, e);
    }
  }

  private static isDuplicateError(e) {
    return TextUtil.contains(e.error, 'ER_DUP_ENTRY');
  }
}
