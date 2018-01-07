import { Recipe } from './crafting/recipe';
import { Reagent } from './crafting/reagent';
import { AuctionItem } from './auction/auction-item';
import { Item } from './item/item';

/**
 * Local storage value: shopping_cart
 */
const example = {
  'recipes': [
    {
      'name': 'Create Fervor Potion',
      'spellID': 898,
      'itemID': 1450,
      'quantity': 1,
      'minCount': 1,
      'reagents': [
        {
          'itemID': 878,
          'name': 'Fist-Sized Spinneret',
          'dropped': true,
          'count': 1
        }
      ]
    }
  ],
  'reagents': [
    {
      'itemID': 878,
      'name': 'Fist-Sized Spinneret',
      'count': 1
    }
  ],
  'cost': 0,
  'buyout': 0,
  'profit': 0
};
export class ShoppingCart {
  recipes: Array<Recipe> = new Array<Recipe>();
  recipesMap: Map<number, Recipe> = new Map<number, Recipe>();
  reagents: Array<Reagent> = new Array<Reagent>();
  reagentsMap: Map<number, Reagent> = new Map<number, Reagent>();
  items: Array<AuctionItem> = new Array<AuctionItem>();
  itemsMap: Map<number, AuctionItem> = new Map<number, AuctionItem>();

  cost: 0;
  buyout: 0;
  profit: 0;

  addEntry(quantity: number, recipe?: Recipe, item?: AuctionItem): void {
    for (let i = 0; i < quantity; i++) {
      if (recipe) {
        this.buyout += recipe.buyout;
        this.cost += recipe.cost;
        this.profit += recipe.roi;
        console.log(this.recipesMap[recipe.spellID]);
        if (this.recipesMap[recipe.spellID]) {
          this.recipesMap[recipe.spellID].quantity++;
        } else {
          this.recipesMap[recipe.spellID] = new ShoppingCartRecipe(recipe.spellID);
          this.recipes.push(this.recipesMap[recipe.spellID]);
          recipe.reagents.forEach(r => {
            this.recipesMap[recipe.spellID]
              .reagents.push(new ShoppingCartReagent(r.itemID, r.count));
          });
        }
      } else if (item) {
        if (this.itemsMap[item.itemID]) {
          this.itemsMap[item.itemID].quantity++;
        } else {
          this.itemsMap[item.itemID] = new ShoppingCartItem(item.itemID);
        }
      }
    }
  }


  restore(): void {
    // Logic inc
  }

  save(): void {
    // Logic inc
  }
}

export class ShoppingCartRecipe {
  spellID: number;
  quantity: number;
  reagents: Array<ShoppingCartReagent> = Array<ShoppingCartReagent>();

  constructor(spellID: number) {
    this.spellID = spellID;
    this.quantity = 1;
  }
}

export class ShoppingCartReagent {
  itemID: number;
  quantity: number;

  constructor(itemID: number, quantity: number) {
    this.itemID = itemID;
    this.quantity = quantity;
  }
}

export class ShoppingCartItem {
  itemID: number;
  quantity = 1;

  constructor(itemID: number) {
    this.itemID = itemID;
  }
}
