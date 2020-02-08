import {BaseCraftingUtil} from './base-crafting.util';
import {Recipe} from '../models/recipe';

export class OptimisticCraftingUtil extends BaseCraftingUtil {
  constructor() {
    super();
  }

  calculateOne(recipe: Recipe, auctionItems: {}): void {

  }
}
