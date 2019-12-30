import {HttpClientUtil} from './http-client.util';
import {languages} from '../static-data/language.data';
import {Language} from '../models/language.model';
import {ItemLocale} from '../models/item/item-locale';
import {WoWHeadUtil} from './wowhead.util';

const PromiseThrottle: any = require('promise-throttle');

export interface Coordinates {
  x: number;
  y: number;
}

export interface Map {
  zoneId: number;
  coordinates: Coordinates[];
}

class VendorItem {
  id: number;
  price: number;
  unitPrice: number;
  currency: number;
  stock: number;
  stackSize: number;

  static setFromBody(body: string): VendorItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'sells')
      .map(({id, standing, react, stack, cost, avail}) => {
        let price = cost[0];
        let currency: number;
        if (cost[2]) {
          price = cost[2][0][1];
          currency = cost[2][0][0];
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

class DroppedItem {
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

export class NPC {
  name: ItemLocale = new ItemLocale();
  tooltip: string;
  map: Map;
  completion_category: number;
  sells: VendorItem[] = [];
  drops: DroppedItem[] = [];
  expansionId?: number;
  isAlliance: boolean;
  isHorde: boolean;
  minLevel?: number;
  maxLevel?: number;
  tag: ItemLocale = new ItemLocale();

  constructor(public id: number) {
  }

  setData?({name, tooltip, map}: { name: string, tooltip: string, map: any }, language: Language): NPC {
    language.locales.forEach(locale => {
      this.setName(name, locale);
    });

    if (language.key === 'en') {
      this.setTooltipData(tooltip);

      this.map = {
        zoneId: map.zone,
        coordinates: map.coords[0].map(coords => ({
          x: coords[0],
          y: coords[1]
        }))
      };
    }
    return this;
  }

  setFromWowHead(body: string, language: Language) {
    const regex = new RegExp(`(g_npcs\\[${this.id}\\],[\\n\\r ]{0,}\\{[\\s\\S]*?(\\);)$){1,}`, 'gm');
    const regexResult = regex.exec(body);
    if (regexResult && regexResult.length) {
      const resString = regexResult[0]
        .replace(new RegExp(`g_npcs\\[${this.id}\\], `, 'gm'), '')
        .replace(/(\);)$/gm, '');
      try {
        const {maxlevel, minlevel, react, tag} = JSON.parse(`${resString}`);
        language.locales.forEach(locale => {
          this.tag[locale] = tag;
        });

        if (language.key === 'en') {
          this.minLevel = minlevel;
          this.maxLevel = maxlevel;
          this.isAlliance = react[0] === 1;
          this.isHorde = react[1] === 1;
        }
      } catch (e) {
        if (language.key === 'en') {
          console.error(resString, e);
        }
      }
    }

    if (language.key === 'en') {
      this.expansionId = WoWHeadUtil.getExpansion(body);
      this.drops = DroppedItem.setFromBody(body);
      this.sells = VendorItem.setFromBody(body);
    }
  }

  private setName?(name: string, locale = 'en_GB'): void {
    this.name[locale] = name;
  }

  private setTooltipData?(tooltip: string): void {
  }
}

export class NPCUtil {
  static getById(id: number) {
    return new Promise<NPC>((resolve, reject) => {
      const npc: NPC = new NPC(id),
        promises: Promise<any>[] = [];

      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      languages
        .forEach(lang => promises.push(
          promiseThrottle.add(() => this.getNpcDataWithLocale(id, lang, npc))));
      Promise.all(promises)
        .then(() => resolve(npc))
        .catch(reject);
    });
  }

  private static getNpcDataWithLocale(id: number, language: Language, npc: NPC) {
    return new Promise<NPC>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/tooltip/npc/${id}?locale=${language.key}`, true)
        .then(async ({body}) => {
          await this.getHtmlAndSetNPCData(id, npc, language);
          resolve(npc.setData(body, language));
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
}
