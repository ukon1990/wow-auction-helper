import {ItemSpells} from './itemspells';
import {WoWHead} from './wowhead';
import {Report} from '../../utils/report.util';

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
  characterMap = {};
  buyout: number;
  sumBuyout: number;
  purchases: ItemPurchase[] = [];

  constructor(item: any, storedIn: string) {
    this.id = item.id;
    this.name = item.name;

    this.addCharacter(item, storedIn);
  }

  addCharacter(item, storedIn: string): void {
    this.quantity += item.value;
    if (!this.characterMap[item.character]) {
      this.characterMap[item.character] = [];
    }

    this.characterMap[item.character].push(` ${item.value} in ${storedIn}`);

    // Such optimal
    this.characters.length = 0;
    Object.keys(this.characterMap).forEach(name => {
      this.characters.push(` ${name}(${this.characterMap[name].toString()})`);
    });
  }

  addPurchase(purchase: object): void {
    // 'this.purchases.push(new ItemPurchase());
  }
}

export class ItemPurchase {
  buyout: number;
  quantity: number;
  timestamp: number;
}
