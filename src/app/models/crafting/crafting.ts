import { Recipe } from './recipe';
import { SharedService } from '../../services/shared.service';
import { Item } from '../item/item';
import { AuctionItem } from '../auction/auction-item';

export class Crafting {
  public static calculateCost(): void {
    SharedService.recipes
      .forEach(r => this.costForRecipe(r));
  }

  private static costForRecipe(recipe: Recipe): void {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.reagents.forEach(r => {

      if (!SharedService.auctionItems[r.itemID] && SharedService.tsm[r.itemID]) {
        recipe.cost += 0;
      } else {
        recipe.cost += this.getCost(r.itemID, r.count);
      }
    });
    recipe.roi = this.getROI(recipe.cost, SharedService.auctionItems[recipe.itemID]);
  }

  private static getCost(itemId: number, count: number): number {
    if (this.useMktPrice(itemId)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return SharedService.tsm[itemId].MarketValue * count;
    } else if (!SharedService.auctionItems[itemId]) {
      return 0;
    }
    return SharedService.auctionItems[itemId].buyout * count;
  }

  private static useMktPrice(itemId: number): boolean {
    if (SharedService.user.apiToUse !== 'none' &&
      SharedService.tsm[itemId] &&
      (!SharedService.auctionItems[itemId] ||
      SharedService.auctionItems[itemId].buyout /
      SharedService.tsm[itemId].MarketValue <=
      SharedService.user.buyoutLimit)) {
      return true;
    }
    return false;
  }

  private static getROI(cost: number, item?: AuctionItem) {
    if (!item) {
      return 0;
    }
    return item.buyout - cost;
  }
}
