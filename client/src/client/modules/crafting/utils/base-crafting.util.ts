import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CustomProcUtil} from './custom-proc.util';
import {Reagent} from '../models/reagent';
import {CustomPrice} from '../models/custom-price';
import {TextUtil} from '@ukon1990/js-utilities';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    NEEDED: 1,
    PESSIMISTIC: 2
  };
  static readonly STRATEGY_LIST = [
    {id: 0, name: 'Optimistic', description: ''},
    {id: 1, name: 'Needed', description: ''},
    {id: 2, name: 'Pessimistic', description: ''}
  ];
  private static intermediateEligible: Recipe[] = [];
  private static intermediateMap: Map<number, Recipe> = new Map();
  private static hasMappedRecipes: boolean;

  private ahCutModifier = 0.95;

  calculate(recipes: Recipe[]): void {
    if (!BaseCraftingUtil.hasMappedRecipes) {
      recipes.forEach(r =>
        this.setSharedServiceRecipeMap(r));
      BaseCraftingUtil.hasMappedRecipes = true;
    }
    recipes.forEach(r => this.calculateOne(r));

    BaseCraftingUtil.intermediateEligible
      .forEach(recipe => this.calculateIntermediate(recipe));
  }

  calculateOne(recipe: Recipe): void {
    if (!recipe) {
      return;
    }
    this.resetRecipePriceValues(recipe);
    this.setRecipePriceAndStatData(recipe);

    recipe.procRate = CustomProcUtil.get(recipe);
    recipe.reagents.forEach(r => {
      this.calculateReagentCosts(r, recipe);
      this.setRecipeForReagent(r, recipe);
    });
    this.setROI(recipe);
  }

  private calculateReagentCosts(r: Reagent, recipe: Recipe) {
    let price;
    const vendor = this.getVendorPriceDetails(r.itemID),
      overridePrice = this.getOverridePrice(r.itemID),
      tradeVendorPrice = this.getTradeVendorPrice(r.itemID);

    if (overridePrice) {
      price = overridePrice.price * r.count;
    } else if (vendor && vendor.price && vendor.stock > 0) {
      price = this.getCostFromVendor(vendor, r);
    } else if (tradeVendorPrice) {
      price = tradeVendorPrice * r.count;
    } else {
      price = this.getPrice(r.itemID, r.count);
    }
    if (!price) {
      const fallback = this.getFallbackPrice(r.itemID, r.count);
      price = fallback.cost;
      r.intermediateEligible = fallback.intermediateEligible;
    }
    r.avgPrice = price / r.count;
    recipe.cost += price / recipe.procRate;
  }

  private setROI(recipe: Recipe) {
    recipe.roi = (recipe.buyout * this.ahCutModifier) - recipe.cost;
  }

  private resetRecipePriceValues(recipe: Recipe) {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.buyout = 0;
  }

  private setRecipeForReagent(r: Reagent, parentRecipe: Recipe) {
    const recipe: Recipe = SharedService.recipesMapPerItemKnown[r.itemID];
    if (!r.recipe && recipe) {
      r.recipe = recipe;
      if (!BaseCraftingUtil.intermediateMap.get(parentRecipe.spellID)) {
        BaseCraftingUtil.intermediateEligible.push(parentRecipe);
        BaseCraftingUtil.intermediateMap.set(parentRecipe.spellID, parentRecipe);
      }
    }
  }

  private getCostFromVendor(vendor: { price: number; stock: number }, r: Reagent) {
    let price = 0;
    if (vendor && vendor.stock && vendor.stock < r.count) {
      price = vendor.price * vendor.stock;
      price += this.getPrice(r.itemID, r.count - vendor.stock);
    } else {
      price = vendor.price * r.count;
    }
    return price;
  }

  private setRecipePriceAndStatData(recipe: Recipe) {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[recipe.itemID];
    if (auctionItem) {
      recipe.buyout = auctionItem.buyout;
      recipe.mktPrice = auctionItem.mktPrice;
      recipe.avgDailySold = auctionItem.avgDailySold;
      recipe.regionSaleRate = auctionItem.regionSaleRate;
      recipe.quantityTotal = auctionItem.quantityTotal;
      recipe.regionSaleAvg = auctionItem.regionSaleAvg;
    }
  }

  private setSharedServiceRecipeMap(recipe: Recipe) {
    if (!SharedService.itemRecipeMap[recipe.itemID]) {
      SharedService.itemRecipeMap[recipe.itemID] = [];
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

  getFallbackPrice(id: number, quantity: number): { cost: number, intermediateEligible: boolean } {
    const result = {
      cost: 0,
      intermediateEligible: false
    };
    const item: AuctionItem = SharedService.auctionItemsMap[id],
      recipe: Recipe = SharedService.recipesMapPerItemKnown[id];
    if (recipe) {
      recipe.reagents.forEach(r => {
        result.cost += this.getPrice(r.itemID, r.count * quantity);
      });
      result.intermediateEligible = true;
    } else if (item) {
      result.cost = item.mktPrice * quantity;
    }
    return result;
  }

  getTradeVendorPrice(id: number): number {
    if (SharedService.tradeVendorItemMap[id] && SharedService.tradeVendorMap[id].useForCrafting) {
      return SharedService.tradeVendorItemMap[id].value;
    }
    return 0;
  }

  getVendorPriceDetails(id: number): { price: number; stock: number } {
    const item: ItemNpcDetails = SharedService.itemNpcMap.get(id);
    if (item) {
      return {
        price: item.vendorBuyPrice,
        stock: item.vendorAvailable < 0 ? 0 : item.vendorAvailable
      };
    }
    return undefined;
  }

  getOverridePrice(id: number): CustomPrice {
    if (SharedService.customPricesMap && SharedService.customPricesMap[id]) {
      return SharedService.customPricesMap[id];
    }
    return undefined;
  }

  abstract getPrice(id: number, quantity: number): number;

  private calculateIntermediate(recipe: Recipe) {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.reagents.forEach(reagent => {
      const knownRecipe: Recipe = SharedService.recipesMapPerItemKnown[reagent.itemID];
      if (this.shouldUseIntermediateForReagent(knownRecipe, reagent)) {
        reagent.intermediateEligible = true;
        reagent.intermediateCount = reagent.count;
        recipe.cost += knownRecipe.cost * reagent.count;
      } else {
        reagent.intermediateEligible = false;
        reagent.intermediateCount = 0;
        recipe.cost += reagent.avgPrice * reagent.count;
      }
    });
    this.setROI(recipe);
  }

  private shouldUseIntermediateForReagent(knownRecipe: Recipe, reagent: Reagent) {
    return knownRecipe &&
      this.isNotMillingOrProspecting(knownRecipe) &&
      knownRecipe.cost < reagent.avgPrice &&
      SharedService.user &&
      SharedService.user.useIntermediateCrafting;
  }

  private isNotMillingOrProspecting(knownRecipe: Recipe) {
    return !TextUtil.contains(knownRecipe.name, 'mass mill') &&
      !TextUtil.contains(knownRecipe.name, 'mass prospect');
  }
}
