import {Item} from '../models/item/item';
import {WoWHeadDroppedBy, WoWHeadSoldBy} from '../models/item/wowhead';

export class ItemExtract {
  static fromItems(items: Item[]) {
    const zoneMap = {};
    const npcMap = {};
    items.forEach(item => this.fromItem(item, npcMap));
    return Object.keys(npcMap)
      .map(k => {
        zoneMap[npcMap[k].zoneId] = npcMap[k].zoneId;
        return npcMap[k];
      });
  }

  private static sort(a, b) {
    return a.sells.length - b.drops.length;
  }

  static fromItem(item: Item, npcMap: any) {
    this.fromDroppedBy(item, npcMap);
    this.fromSoldBy(item, npcMap);
  }

  private static fromSoldBy(item: Item, npcMap: any) {
    if (!item.itemSource.soldBy) {
      return;
    }
    item.itemSource.soldBy.forEach((droppedBy: WoWHeadSoldBy) => {
      this.addNpcIfNoExists(npcMap, droppedBy.id, droppedBy.name, droppedBy.location,
        droppedBy.minLevel, droppedBy.maxLevel, droppedBy.react, droppedBy.tag);
      npcMap[droppedBy.id].sells.push({
        id: item.id,
        type: droppedBy.type,
        tag: droppedBy.tag,
        react: droppedBy.react,
        cost: droppedBy.cost,
        stock: droppedBy.stock,
        currency: droppedBy.currency,
        org: droppedBy
      });
    });
  }

  private static fromDroppedBy(item: Item, npcMap: Map<number, any>) {
    if (!item.itemSource.droppedBy) {
      return;
    }
    item.itemSource.droppedBy.forEach((droppedBy: WoWHeadDroppedBy) => {
      this.addNpcIfNoExists(npcMap, droppedBy.id, droppedBy.name, droppedBy.location,
        droppedBy.minLevel, droppedBy.maxLevel, droppedBy.react, '');
      npcMap[droppedBy.id].drops.push({
        id: item.id,
        type: droppedBy.type,
        count: droppedBy.count,
        outof: droppedBy.outof,
        dropChance: droppedBy.dropChance,
        pctstack: droppedBy.pctstack,
        org: droppedBy
      });
    });
  }

  private static addNpcIfNoExists(npcMap: any, id: number, name, location: number[],
                                  minLevel: number, maxLevel: number, react: number[], tag: string) {
    let npc = npcMap[id];
    if (!npc) {
      npc = {
        id,
        zoneId: location ? location[0] : undefined,
        name,
        tag,
        minLevel,
        maxLevel,
        sells: [],
        drops: []
      };
      npcMap[id] = npc;
    }
    if (!npc.zoneId && location) {
      npc.zoneId = location[0];
    }

    if (!npc.minLevel && minLevel) {
      npc.minLevel = minLevel;
    }

    if (!npc.maxLevel && maxLevel) {
      npc.maxLevel = maxLevel;
    }
    if (!npc.isHorde && react) {
      npc.isHorde = react[1] === 1;
    }

    if (!npc.isAlliance && react) {
      npc.isAlliance = react[0] === 1;
    }
  }
}
