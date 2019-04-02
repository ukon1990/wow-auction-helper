import {GoldPipe} from '../pipes/gold.pipe';
import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {SharedService} from '../services/shared.service';

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

  upgrade(old: any): void {
    // TODO: Do this
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

  remove(id: number, quantity?: number): void {
    const recipe = SharedService.recipesMap[id],
      cartRecipe: ShoppingCartItem = this.recipeMap[id];
    if (!recipe || !cartRecipe) {
      return;
    }

    if (!quantity) {
      quantity = cartRecipe.quantity;
    }

    cartRecipe.decrement(quantity);

    if (cartRecipe.quantity <= 0) {
      this.removeFromList(cartRecipe, this.recipes, this.recipeMap);
    }

    recipe.reagents
      .forEach((reagent: Reagent) => {
        if (this.reagentMap[reagent.itemID]) {
          const cartReagent = (this.reagentMap[reagent.itemID] as ShoppingCartItem);

          cartReagent.decrement(
            reagent.count * quantity);

          if (cartReagent.quantity <= 0) {
            this.removeFromList(cartReagent, this.reagents, this.reagentMap);
          }
        }
      });
  }

  private removeFromList(cartItem: ShoppingCartItem, array: ShoppingCartItem[], map: object) {
    const index = array
      .findIndex((item) =>
        item === cartItem);
    array.splice(index, 1);
    delete map[cartItem.id];
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
