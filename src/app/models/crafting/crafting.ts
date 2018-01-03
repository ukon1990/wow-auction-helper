import { Recipe } from './recipe';
import { SharedService } from '../../services/shared.service';
import { Item } from '../item/item';
import { AuctionItem } from '../auction/auction-item';

export class Crafting {
  public static calculateCost(): void {
    Object.keys(SharedService.itemRecipeMap).forEach(key => {
      SharedService.itemRecipeMap[key].length = 0;
    });

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
      if (SharedService.auctionItemsMap[recipe.itemID]) {
        recipe.mktPrice = SharedService.auctionItemsMap[recipe.itemID].mktPrice;
        recipe.buyout = SharedService.auctionItemsMap[recipe.itemID].buyout;
        recipe.avgDailySold = SharedService.auctionItemsMap[recipe.itemID].avgDailySold;
        recipe.regionSaleRate = SharedService.auctionItemsMap[recipe.itemID].regionSaleRate;
        recipe.quantityTotal = SharedService.auctionItemsMap[recipe.itemID].quantityTotal;
        recipe.regionSaleAvg = SharedService.auctionItemsMap[recipe.itemID].regionSaleAvg;
      }
      recipe.reagents.forEach(r => {
        if (SharedService.user.customPrices && SharedService.user.customPrices[r.itemID]) {
          recipe.cost += SharedService.user.customPrices[r.itemID] * r.count;
        } else if (SharedService.tradeVendorItemMap[r.itemID]) {
          recipe.cost += SharedService.tradeVendorItemMap[r.itemID].value * r.count;
        } else if (!SharedService.auctionItemsMap[r.itemID] && SharedService.tsm[r.itemID]) {
          recipe.cost = 0;
        } else {
          recipe.cost += this.getCost(r.itemID, r.count);
        }
      });
      recipe.roi = this.getROI(recipe.cost, SharedService.auctionItemsMap[recipe.itemID]);
    } catch (e) {
      console.error('Calc issue with recipe', e, recipe);
    }

    if (!SharedService.itemRecipeMap[recipe.itemID]) {
      SharedService.itemRecipeMap[recipe.itemID] = new Array<Recipe>();
    }
    SharedService.itemRecipeMap[recipe.itemID].push(recipe);
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
