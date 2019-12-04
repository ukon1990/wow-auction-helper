import { ItemSpells } from './itemspells';
import { NPC } from './wowdb';
import { WoWHead } from './wowhead';
import {ItemGameData} from './item-game-data.model';

export class Item {
  id: number;
  name = 'Missing item';
  icon = 'inv_scroll_03';
  itemLevel: number;
  itemClass: number;
  itemSubClass: number;
  quality: number;
  itemSpells: ItemSpells[] = [];
  itemSource?: WoWHead = new WoWHead();
  buyPrice: number;
  sellPrice: number;
  itemBind: number;
  minFactionId: string;
  minReputation: number;
  isDropped: boolean;
  expansionId: number;

  constructor(item?: Item) {
    if (item) {
      this.id = item.id;
      this.name = item.name;
      this.icon = item.icon;
      this.itemLevel = item.itemLevel;
      this.itemClass = item.itemClass;
      this.itemSubClass = item.itemSubClass;
      this.quality = item.quality;
      this.buyPrice = item.buyPrice;
      this.sellPrice = item.sellPrice;
      this.itemBind = item.itemBind;
      this.minFactionId = item.minFactionId;
      this.minReputation = item.minReputation;
    }
  }

  fromAPI(item: ItemGameData, locale: string = 'en_GB'): Item {
    this.id = item.id;
    this.name = item.name[locale];
    this.itemLevel = item.level;
    this.itemClass = item.item_class.id;
    this.itemSubClass = item.item_subclass.id;
    this.quality = this.getQuality(item);
    this.buyPrice = item.purchase_price;
    this.sellPrice = item.sell_price;
    return this;
  }

  private getQuality(item: ItemGameData) {
    switch (item.quality.type) {
      case 'POOR':
        return 0;
      case 'COMMON':
        return 1;
      case 'UNCOMMON':
        return 2;
      case 'RARE':
        return 3;
      case 'EPIC':
        return 4;
      case 'LEGENDARY':
        return 5;
    }
  }
}
