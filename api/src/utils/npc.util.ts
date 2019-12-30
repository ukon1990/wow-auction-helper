import {HttpClientUtil} from './http-client.util';
import {languages} from '../static-data/language.data';
import {Language} from '../models/language.model';
import {ItemLocale} from '../models/item/item-locale';
import {WoWHeadUtil} from './wowhead.util';
import {classBody} from '@babel/types';

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
      promises.push(promiseThrottle.add(() =>
        this.getHtmlAndSetNPCData(id, npc)));
      Promise.all(promises)
        .then(() => resolve(npc))
        .catch(reject);
    });
  }

  private static getNpcDataWithLocale(id: number, language: Language, npc: NPC) {
    return new Promise<NPC>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/tooltip/npc/${id}?locale=${language.key}`, true)
        .then(({body}) => resolve(npc.setData(body, language)))
        .catch((error) => {
          console.error({
            id,
            error
          });
          resolve(undefined);
        });
    });
  }

  private static getHtmlAndSetNPCData(id: number, npc: NPC) {
    return new Promise<any>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/npc=${id}`, false)
        .then(({body}) => {
          npc.expansionId = WoWHeadUtil.getExpansion(body);
          npc.drops = DroppedItem.setFromBody(body);
          npc.sells = VendorItem.setFromBody(body);
          resolve(npc);
        })
        .catch(reject);
    });
  }
}
