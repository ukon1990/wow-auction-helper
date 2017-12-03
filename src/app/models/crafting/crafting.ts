import { Recipe } from './recipe';
import { SharedService } from '../../services/shared.service';

export class Crafting {
  public static calculateCost(): void {
    SharedService.recipes
      .forEach(r => this.costForRecipe(r));
  }
  private static costForRecipe(recipe: Recipe): void {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.reagents.forEach(r => {
      recipe.cost += (SharedService.auctionItems[r.itemID].buyout * r.count);
    });
    recipe.roi = SharedService.auctionItems[recipe.itemID].buyout - recipe.cost;
  }
}
