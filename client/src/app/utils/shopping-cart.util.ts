import {GoldPipe} from '../pipes/gold.pipe';
import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';

export class ShoppingCartUtil {
  /**
   * TODO: Import old shopping list type to new one before release!!!
   */
  private pipe: GoldPipe = new GoldPipe();

  setCart(): void {
  }

  isVendor(id: number): boolean {
    return false;
  }

  shouldBuyFromAH(id: number): boolean {
    return false;
  }

  isInInventory(id: number): boolean {
    return false;
  }
}

export class ShoppingCart {
  // Recipe ID's
  recipes: ShoppingCartItem[] = [];
  recipeMap = {};
  shoppingString: string;
  reagents: ShoppingCartItem[] = [];
  reagentMap = {};

  constructor() {

  }

  add(recipe: Recipe, quantity: number = 1): void {
    if (this.recipeMap[recipe.spellID]) {
      (this.recipeMap[recipe.spellID] as ShoppingCartItem)
        .increment(quantity);
    } else {
      this.recipeMap[recipe.spellID] = new ShoppingCartItem(
        recipe.spellID, quantity);
      this.recipes.push(this.recipeMap[recipe.spellID]);
    }
    this.addReagents(recipe, quantity);
  }

  addReagents(recipe: Recipe, quantity: number = 1): void {
    recipe.reagents
      .forEach((reagent: Reagent) => {
        if (this.reagentMap[reagent.itemID]) {
          (this.reagentMap[reagent.itemID] as ShoppingCartItem)
            .increment(
              reagent.count * quantity);
        } else {
          const item = new ShoppingCartItem(
            reagent.itemID, reagent.count * quantity);
          this.reagentMap[reagent.itemID] = item;
          this.reagents.push(item);
        }
      });
  }

  remove(id: number): void {
  }
}

export class ShoppingCartItem {
  constructor(public id: number, public quantity: number) {
  }

  increment(quantity: number): void {
    this.quantity += quantity;
  }

  decrement(quantity: number): number {
    this.quantity -= quantity;
    return this.quantity;
  }
}
