import {DroppedItem, NPC, NPCCoordinate, SkinnedItem, VendorItem} from '../models/npc.model';
import {ErrorReport} from '../../../utils/error-report.util';

export interface SellsType {
  id: string;
  item: VendorItem;
  foundOn: number[];
}

export interface DropsType {
  id: number;
  item: DroppedItem;
  foundOn: number[];
}

export interface SkinningType {
  id: number;
  item: SkinnedItem;
  foundOn: number[];
}

export interface NpcSplitType {
  bases: NPC[];
  sells: SellsType[];
  drops: DropsType[];
  skinning: SkinningType[];
  // coordinates: { id: string, item: NPCCoordinate }[];
}

export class NpcUtil {

  private static getValue<T>(item: SellsType | DropsType | SkinningType): number[] {
    return (item && item.foundOn ? item.foundOn : []);
  }

  static combine(data: NpcSplitType): NPC[] {
    const map = new Map<number, NPC>();
    const list: NPC[] = [];

    if (data) {
      data.bases.forEach(npc => {
        if (!npc) {
          return;
        }
        map.set(npc.id, npc);
        list.push(npc);
      });

      data.sells.forEach(item => {
        this.getValue(item).forEach(npcId => {
          map.get(npcId).sells.push(item.item);
        });
      });

      data.drops.forEach(item => {
        this.getValue(item).forEach(npcId => {
          map.get(npcId).drops.push(item.item);
        });
      });

      data.skinning.forEach(item => {
        this.getValue(item).forEach(npcId => {
          map.get(npcId).skinning.push(item.item);
        });
      });
    } else {
      ErrorReport.sendError('NpcUtil.combine', {name: 'The value is empty', stack: ''} as Error);
    }

    return list;
  }

  static split(npcs: NPC[]): NpcSplitType {
    const result: NpcSplitType = {
      bases: [],
      sells: [],
      drops: [],
      skinning: [],
      // coordinates: []
    };
    const soldByMap = new Map<string, SellsType>();
    const droppedByMap = new Map<number, DropsType>();
    const skinnedFromMap = new Map<number, SkinningType>();

    npcs.forEach(npc => {
      this.addExtractedBase(npc, result);
      this.addExtractedSoldItems(npc, result, soldByMap);
      this.addExtractedDroppedItems(npc, result, droppedByMap);
      this.addExtractedSkinnedItems(npc, result, skinnedFromMap);
    });

    return result;
  }

  private static addExtractedBase(npc: NPC, result: NpcSplitType) {
    const base: NPC = {
      ...npc,
      sells: [],
      drops: [],
      skinning: [],
    };
    result.bases.push(base);
  }

  private static addExtractedSoldItems(npc: NPC, result: NpcSplitType, soldByMap: Map<string, SellsType>) {
    (npc.sells || []).forEach(sold => {
      const id = sold.id + '-' + sold.unitPrice;
      if (!soldByMap.has(id)) {
        const res = {
          id,
          item: {...sold},
          foundOn: [npc.id]
        };
        result.sells.push(res);
        soldByMap.set(id, res);
      } else {
        soldByMap.get(id).foundOn.push(npc.id);
      }
    });
  }

  private static addExtractedDroppedItems(npc: NPC, result: NpcSplitType, droppedByMap: Map<number, DropsType>) {
    (npc.drops || []).forEach(mob => {
      if (!droppedByMap.has(mob.id)) {
        const res = {
          id: mob.id,
          item: {...mob},
          foundOn: [npc.id]
        };
        result.drops.push(res);
        droppedByMap.set(mob.id, res);
      } else {
        droppedByMap.get(mob.id).foundOn.push(npc.id);
      }
    });
  }

  private static addExtractedSkinnedItems(npc: NPC, result: NpcSplitType, skinnedFromMap: Map<number, SkinningType>) {
    (npc.skinning || []).forEach(mob => {
      if (!skinnedFromMap.has(mob.id)) {
        const res = {
          id: mob.id,
          item: {...mob},
          foundOn: [npc.id]
        };
        result.skinning.push(res);
        skinnedFromMap.set(mob.id, res);
      } else {
        skinnedFromMap.get(mob.id).foundOn.push(npc.id);
      }
    });
  }
}
