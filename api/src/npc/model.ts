import {WoWHeadUtil} from '../utils/wowhead.util';
import {ItemLocale} from '@shared/models';
import {Language} from '../models/language.model';

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
  price: number = null;
  unitPrice: number = null;
  currency: number = null;
  stock: number = null;
  standing?: number = null;
  stackSize: number = null;

  static setFromBody(body: string): VendorItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'sells')
      .map(({id, standing, stack, cost, avail}) => {
        let price = cost[0];
        let currency: number = null;
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
          console.error('NPCUtil.setFromBody: cost', cost, e);
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
  dropped?: number = null;
  outOf?: number = null;
  dropChance: number = null;

  static setFromBody(body: string): DroppedItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'drops').map(({id, modes}) => ({
      id,
      dropped: modes[1] ? modes[1].count : 0,
      outOf: modes[1] ? modes[1].outof : 0,
      dropChance: modes[1] ? (modes[1].count / modes[1].outof) : 0
    }) as DroppedItem);
  }
}

export class SkinnedItem {
  id: number;
  dropped: number = null;
  outOf: number = null;
  dropChance: number = null;

  static setFromBody(body: string): SkinnedItem[] {
    return WoWHeadUtil.getNewListViewData(body, 'item', 'skinning')
      .map((entry: any) => {
        // In case I care later: pctstack is = {1: 32.8257,2: 67.1743}
        const {id, count, totalCount} = entry;
        return {
          id,
          dropped: count,
          outOf: totalCount,
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
      const level = WoWHeadUtil.getLevel(body);
      this.expansionId = patchAndExpansion.expansionId;
      this.patch = patchAndExpansion.patch;
      this.avgGoldDrop = this.getGoldDrop(body);
      this.drops = DroppedItem.setFromBody(body);
      this.sells = VendorItem.setFromBody(body);
      this.skinning = SkinnedItem.setFromBody(body);

      if (!this.minLevel) {
        this.minLevel = level;
      }
      if (!this.maxLevel) {
        this.maxLevel = level;
      }
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