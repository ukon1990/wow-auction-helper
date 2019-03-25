import {ItemSpells} from './itemspells';
import {WoWHead} from './wowhead';

export class Item {
  id: number;
  name = 'Missing item';
  icon = 'inv_scroll_03';
  itemLevel: number;
  itemClass: number;
  itemSubClass: number;
  quality: number;
  itemSource?: WoWHead;
  itemSpells?: ItemSpells[];
  buyPrice: number;
  sellPrice: number;
  itemBind: number;
  minFactionId: string;
  minReputation: number;
  isDropped: boolean;
  vendorBoughtLimit?: number;
  isBoughtForGold?: boolean;
  expansionId = 0;

  inventory: ItemInventory;
}

export class ItemInventory {
  id: number;
  name: string;
  quantity = 0;
  characters: string[] = [];
  buyout: number;
  sumBuyout: number;

  constructor(item: any, storedIn: string) {
    this.id = item.id;
    this.name = item.name;

    this.addCharacter(item, storedIn);
  }

  addCharacter(item, storedIn: string): void {
    this.quantity += item.value;
    this.characters.push(`${item.character}(${item.value} in ${storedIn})`);
  }
}
