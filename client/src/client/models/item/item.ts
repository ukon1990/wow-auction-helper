import {ItemSpells} from './itemspells';
import {WoWHead} from './wowhead';
import {ItemLocale} from '../../../../../api/src/models/item/item-locale';
import {ItemGameData} from '../../../../../api/src/models/item/item-game-data.model';

export class Item {
  id: number;
  name = 'Missing item';
  icon = 'inv_scroll_03';
  itemLevel: number;
  itemClass: number;
  itemSubClass: number;
  quality: number;
  itemSource?: WoWHead = new WoWHead();
  itemSpells?: ItemSpells[];
  buyPrice: number;
  currencyId: number;
  sellPrice: number;
  itemBind: number;
  minFactionId: string;
  minReputation: number;
  isDropped: boolean;
  vendorBoughtLimit?: number;
  isBoughtForGold?: boolean;
  expansionId = 0;
  nameLocales: ItemLocale;

  inventory: ItemInventory;

  /* istanbul ignore next */
  fromAPI(item: ItemGameData, locale: string = 'en_GB'): Item {
    item.name.id = item.id;
    item.name.pt_PT = item.name.pt_BR;
    item.name.pl_PL = item.name.en_GB;

    this.id = item.id;
    this.name = item.name[locale];
    this.nameLocales = item.name;
    this.itemLevel = item.level;
    this.itemClass = item.item_class.id;
    this.itemSubClass = item.item_subclass.id;
    this.quality = this.getQuality(item);
    this.buyPrice = item.purchase_price;
    this.sellPrice = item.sell_price;
    return this;
  }

  setDataFromWoWHead(wowHead: any) {
    this.expansionId = wowHead.expansionId;
    delete wowHead.expansionId;
    this.itemSource = wowHead;
  }

  /* istanbul ignore next */
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
