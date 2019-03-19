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
      // In case an item is removed from blizzards API, but is still in wowdb
      Object.keys(item).forEach(key => {
        if (!item[key]) {
          switch (key) {
            case 'id':
              this.setValueToItem(item, wowDBItem, key, 'ID');
              break;
            case 'name':
              this.setValueToItem(item, wowDBItem, key, 'Name');
              break;
            case 'icon':
              item.icon = 'inv_scroll_03';
              break;
            case 'itemLevel':
              this.setValueToItem(item, wowDBItem, key, 'Level');
              break;
            case 'itemClass':
              this.setValueToItem(item, wowDBItem, key, 'Class');
              break;
            case 'itemSubClass':
              this.setValueToItem(item, wowDBItem, key, 'SubClass');
              break;
            case 'buyPrice':
              this.setValueToItem(item, wowDBItem, key, 'BuyPrice');
              break;
            case 'sellPrice':
              this.setValueToItem(item, wowDBItem, key, 'SellPrice');
              break;
            case 'itemBind':
              this.setValueToItem(item, wowDBItem, key, 'BindType');
              break;
          }
        }
      });
  }

  private static setValueToItem(item: Item, wowDBItem: WoWDBItem, key: string, wowDBkey: string) {
    item[key] = wowDBItem[wowDBkey];
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
