import {GoldPipe} from '../pipes/gold.pipe';
import {Recipe} from '../models/crafting/recipe';

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
  recipes: number[] = [];
  shoppingString: string;
  reagents: {
    id: number;
    quantity: number;
  };

  constructor() {

  }

  add(recipe: Recipe): void {
  }

  remove(id: number): void {}
}
