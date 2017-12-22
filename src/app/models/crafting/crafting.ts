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
    if (recipe === null || recipe === undefined) {
      return;
    }

    try {
      recipe.cost = 0;
      recipe.roi = 0;
      recipe.reagents.forEach(r => {

        if (!SharedService.auctionItemsMap[r.itemID] && SharedService.tsm[r.itemID]) {
          recipe.cost += 0;
        } else {
          recipe.cost += this.getCost(r.itemID, r.count);
        }
      });
      recipe.roi = this.getROI(recipe.cost, SharedService.auctionItemsMap[recipe.itemID]);
    } catch (e) {
      console.error('Calc issue with recipe', e, recipe);
    }
  }

  private static getCost(itemId: number, count: number): number {
    if (this.useMktPrice(itemId)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return SharedService.tsm[itemId].MarketValue * count;
    } else if (!SharedService.auctionItemsMap[itemId]) {
      return 0;
    }
    return SharedService.auctionItemsMap[itemId].buyout * count;
  }

  private static useMktPrice(itemId: number): boolean {
    if (SharedService.user.apiToUse !== 'none' &&
      SharedService.tsm[itemId] &&
      (!SharedService.auctionItemsMap[itemId] ||
      SharedService.auctionItemsMap[itemId].buyout /
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
