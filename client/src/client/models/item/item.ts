import {ItemSpells} from './itemspells';
import {WoWHead} from './wowhead';
import {ItemLocale} from '../../../../../api/src/models/item/item-locale';
import {ItemGameData, PreviewItemSpells} from '../../../../../api/src/models/item/item-game-data.model';

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
  patch: string;
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
    this.setSellPrice(item);
    if (item.preview_item.requirements &&
      item.preview_item.requirements.reputation &&
      item.preview_item.requirements.reputation.faction) {
      this.minFactionId = '' + item.preview_item.requirements.reputation.faction.id;
      this.minReputation = item.preview_item.requirements.reputation.min_reputation_level;
    }
    // TODO: this.itemSpells = this.getItemSpellsFromGameData(item.preview_item.spells);
    return this;
  }

  setDataFromWoWHead(wowHead: any) {
    this.expansionId = wowHead.expansionId;
    this.patch = wowHead.patch;
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

  private getItemSpellsFromGameData(spells: PreviewItemSpells[]) {
    return spells.map(spell => ({
      SpellId: spell.spell.id,
      Text: spell.description
    }));
  }

  private setSellPrice(item: ItemGameData) {
    const baseSellPrice = item.sell_price,
      previewSellPrice = item.preview_item.sell_price.value;

    if (baseSellPrice < previewSellPrice) {
      this.sellPrice = baseSellPrice;
    } else {
      this.sellPrice = previewSellPrice;
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
