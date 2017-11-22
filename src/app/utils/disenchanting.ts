import { lists } from './globals';
import Auction from 'app/utils/auctions';

export class Disenchanting {
  disenchantables;
  onlyProfitable = false;
  isCrafting = false;
  itemQuality = {
    1: 'Gray',
    2: 'Green',
    3: 'Blue',
    4: 'Epic',
    5: 'Legendary'
  };
  bonusListMods = {
    3408: {
      'ilvl': -110,
      'quality': -1
    }
  };
  selected = 0;
  materials = [
    // Legion
    { 'id': 124442, 'quality': 4, 'minILVL': 800, 'maxILVL': 1000, 'yield': { 'iLvL': 1, 'min': 1, 'max': 1 } },
    { 'id': 124441, 'quality': 3, 'minILVL': 660, 'maxILVL': 900, 'yield': { 'iLvL': 1, 'min': 1, 'max': 1 } },
    { 'id': 124440, 'quality': 2, 'minILVL': 680, 'maxILVL': 900, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    // Warlords
    { 'id': 113588, 'quality': 4, 'minILVL': 630, 'maxILVL': 799, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 111245, 'quality': 3, 'minILVL': 505, 'maxILVL': 700, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 109693, 'quality': 2, 'minILVL': 494, 'maxILVL': 700, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    // Mists of Pandaria
    { 'id': 74248, 'quality': 4, 'minILVL': 420, 'maxILVL': 629, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 74247, 'quality': 3, 'minILVL': 430, 'maxILVL': 463, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 74249, 'quality': 2, 'minILVL': 364, 'maxILVL': 429, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },

    // Cataclysm
    { 'id': 52722, 'quality': 4, 'minILVL': 352, 'maxILVL': 397, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 52721, 'quality': 3, 'minILVL': 318, 'maxILVL': 377, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 52719, 'quality': 2, 'minILVL': 306, 'maxILVL': 333, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 52555, 'quality': 2, 'minILVL': 278, 'maxILVL': 333, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 52718, 'quality': 2, 'minILVL': 272, 'maxILVL': 305, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    // Wrath of the Lich King
    { 'id': 34057, 'quality': 4, 'minILVL': 200, 'maxILVL': 277, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 34052, 'quality': 3, 'minILVL': 167, 'maxILVL': 200, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 34055, 'quality': 2, 'minILVL': 154, 'maxILVL': 182, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 34056, 'quality': 2, 'minILVL': 130, 'maxILVL': 150, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
    { 'id': 34054, 'quality': 2, 'minILVL': 130, 'maxILVL': 182, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },

    // The burning crusade

    // Vanilla
  ];

  constructor(isCrafting) {
    this.isCrafting = isCrafting;
  }

  applyFilter(onlyMyRecipes, knownRecipes, profession) {
    if (this.isCrafting) {
      this.applyRecipes(onlyMyRecipes, knownRecipes, profession);
    } else {
      this.applyItems();
    }
    return this.disenchantables;
  }

  isDisenchantable(itemID: string): boolean {
    return false;
  }

  applyRecipes(onlyMyRecipes, knownRecipes, profession): void {
    let match: boolean;

    this.disenchantables = [];
    lists.recipes.forEach(recipe => {
      match = true;
      if (profession !== 'All' && profession !== recipe.profession) {
        match = false;
      } else if (onlyMyRecipes && !knownRecipes[recipe.spellID]) {
        match = false;
      }

      if (match && lists.items[recipe.itemID] &&
        lists.items[recipe.itemID].quality === this.materials[this.selected].quality &&
        lists.items[recipe.itemID].itemLevel >= this.materials[this.selected].minILVL &&
        lists.items[recipe.itemID].itemLevel <= this.materials[this.selected].maxILVL) {

        if (this.onlyProfitable &&
          (Auction.getMinPrice(this.materials[this.selected].id + '') - recipe.cost) <= 0) {
          return;
        }
        this.disenchantables.push(recipe);
      }
    });
    this.disenchantables.sort((a, b) => {
      return a.cost - b.cost;
    });
  }

  getLength(): number {
    console.log('DE length', this.disenchantables);
    return this.disenchantables.length;
  }

  applyItems() {
    console.log('The type=' + (typeof this.materials[this.selected].quality) + ' ' + this.materials[this.selected].quality);
    this.disenchantables = [];
    Object.keys(lists.auctions).map(k => {
      if (lists.items[k] && (lists.items[k].itemClass === '4' || lists.items[k].itemClass === '2') &&
        lists.items[k].itemLevel > 1) {
        // Checking if matching desiered target item
        if (k === '121023') {
          console.log(lists.items[k]);
          console.log(lists.auctions[k]);
        }
        if (lists.items[k] &&
          lists.items[k].quality === this.materials[this.selected].quality &&
          lists.items[k].itemLevel >= this.materials[this.selected].minILVL) {

          if (this.onlyProfitable && Auction.getMinPrice(k) > 0 &&
            Auction.getMinPrice(this.materials[this.selected].id + '') <= Auction.getMinPrice(k)) {
            return;
          }
          console.log(lists.auctions[k]);
          this.disenchantables.push(lists.auctions[k]);
        }
      }
    });

    this.disenchantables.sort((a, b) => {
      return a.buyout - b.buyout;
    });
  }

  getItemName(itemID: string) {
    if (lists.items[itemID]) {
      return lists.items[itemID].name;
    }
    return 'Unknown';
  }
}
