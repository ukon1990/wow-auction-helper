import { Item } from './item';

export class WoWDBItem {
  ID: number;
  Name: string;
  Level: number;
  Class: number;
  Subclass: number;
  Quality: number;
  BindType: string;
  SellPrice: number;
  BuyPrice: number;
  Spells: Array<any>;
  RequiredFactionStanding: string;
  DroppedBy?: Array<NPC>;
  PossibleBonuses?: Array<ItemBonus>;

  public static setItemWithWoWDBValues(wowDBItem: WoWDBItem, item: Item): void {
      item.itemSpells = wowDBItem.Spells ? wowDBItem.Spells : [];
      item.minReputation = parseInt(wowDBItem.RequiredFactionStanding, 10);
      item.isDropped = wowDBItem.DroppedBy ? wowDBItem.DroppedBy.length > 0 : false;
  }
}

export class NPC {
  ID: number;
  Name: string;
}

class ItemBonus {
  label: string;
  bonusIDs: string;
}
