import { Recipe } from "./crafting/recipe";
import { Reagent } from "./crafting/reagent";
import { AuctionItem } from "./auction/auction-item";

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
  reagents: Array<Reagent> = new Array<Reagent>();
  items: Array<AuctionItem> = new Array<AuctionItem>();

  addEntry(): void {
    // Logic inc
  }

  restore(): void {
    // Logic inc
  }

  save(): void {
    // Logic inc
  }
}
