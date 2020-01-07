import {Recipe} from '../../crafting/models/recipe';

export class ShoppingCartItem {
  subCraft: ShoppingCartItem;
  cost = 0;
  avgCost = 0;
  totalCost = 0;
  totalCount = 0;

  inventoryValue = 0;
  inventoryQuantity = 0;
  characters?: any[];

  constructor(public id: number, public quantity: number, private subRecipe?: Recipe, public itemID?: number) {
    if (subRecipe) {
      // this.subCraft = new ShoppingCartItem(subRecipe.spellID, );
    }
  }

  increment(quantity: number): void {
    this.quantity += quantity;
  }

  decrement(quantity: number): number {
    this.quantity -= quantity;
    return this.quantity;
  }

  setCharacters(characters: any[]): void {
    this.characters = characters;
  }
}
