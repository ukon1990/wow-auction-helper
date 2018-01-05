import { Recipe } from './recipe';
import { SharedService } from '../../services/shared.service';
import { Item } from '../item/item';
import { AuctionItem } from '../auction/auction-item';
import { CraftingService } from '../../services/crafting.service';

export class Crafting {

  public static checkForMissingRecipes(craftingService: CraftingService): void {
    Object.keys(SharedService.recipesForUser).forEach(key => {
      try {
        if (!SharedService.recipesMap[key]) {
          craftingService.getRecipe(parseInt(key, 10));
        }
      } catch (e) {
        console.error('checkForMissingRecipes failed', e);
      }
    });
  }

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
        recipe.cost += this.getCost(r.itemID, r.count);
      });
      recipe.roi = this.getROI(recipe.cost, SharedService.auctionItemsMap[recipe.itemID]);
    } catch (e) {
      console.error('Calc issue with recipe', e, recipe);
    }

    if (!SharedService.itemRecipeMap[recipe.itemID]) {
      SharedService.itemRecipeMap[recipe.itemID] = new Array<Recipe>();
    }
    SharedService.itemRecipeMap[recipe.itemID].push(recipe);

    // The user should see item combination items as "known"
    if (recipe.profession === 'none') {
      SharedService.recipesForUser[recipe.spellID] = ['Item'];
    }

    // For intermediate crafting
    if (SharedService.recipesForUser[recipe.spellID]) {
      if (!SharedService.recipesMapPerItemKnown[recipe.itemID] || SharedService.recipesMapPerItemKnown[recipe.itemID].cost > recipe.cost) {
        SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
      }
    }
  }

  public static getCost(itemID: number, count: number): number {
    if (SharedService.customPricesMap && SharedService.customPricesMap[itemID]) {
      return SharedService.customPricesMap[itemID].price * count;
    } else if (SharedService.tradeVendorItemMap[itemID]) {
      return SharedService.tradeVendorItemMap[itemID].value * count;
    } else if (this.useMktPrice(itemID)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return SharedService.tsm[itemID].MarketValue * count;
    } else if (!SharedService.auctionItemsMap[itemID]) {
      return 0;
    }
    return SharedService.auctionItemsMap[itemID].buyout * count;
  }

  /*
  public static getReagentCraftCost(itemID: number, count: number): number {
    return
  }*/


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
