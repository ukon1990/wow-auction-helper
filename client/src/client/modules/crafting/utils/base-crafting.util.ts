import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CustomProcUtil} from './custom-proc.util';
import {Reagent} from '../models/reagent';
import {CustomPrice} from '../models/custom-price';
import {TextUtil} from '@ukon1990/js-utilities';
import {CraftingService} from '../../../services/crafting.service';
import {NpcService} from '../../npc/services/npc.service';

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

    recipe.procRate = CustomProcUtil.get(recipe) || 1;

    recipe.reagents.forEach(r => {
      this.calculateReagentCosts(r, recipe);
      this.setRecipeForReagent(r, recipe);
    });
    this.setROI(recipe);
  }

  private calculateReagentCosts(reagent: Reagent, recipe: Recipe) {
    let price;
    const vendor = this.getVendorPriceDetails(reagent.id),
      overridePrice = this.getOverridePrice(reagent.id),
      tradeVendorPrice = this.getTradeVendorPrice(reagent.id),
      quantity = reagent.quantity / recipe.procRate;

    if (overridePrice) {
      price = overridePrice.price * quantity;
    } else if (vendor && vendor.price && !vendor.stock) {
      price = this.getCostFromVendor(vendor, reagent, quantity);
    } else if (tradeVendorPrice) {
      price = tradeVendorPrice * quantity;
    } else {
      price = this.getPrice(reagent.id, quantity);
    }
    if (!price) {
      const fallback = this.getFallbackPrice(reagent.id, quantity);
      price = fallback.cost;
      reagent.intermediateEligible = fallback.intermediateEligible;
    }
    reagent.avgPrice = price / quantity;
    recipe.cost += price;
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
    const recipe: Recipe = CraftingService.map.value.get(r.id);
    if (!r.recipe && recipe) {
      r.recipe = recipe;
      if (!BaseCraftingUtil.intermediateMap.get(parentRecipe.id)) {
        BaseCraftingUtil.intermediateEligible.push(parentRecipe);
        BaseCraftingUtil.intermediateMap.set(parentRecipe.id, parentRecipe);
      }
    }
  }

  private getCostFromVendor(vendor: { price: number; stock: number }, r: Reagent, count: number) {
    let price = 0;
    if (vendor && vendor.stock && vendor.stock < count) {
      price = vendor.price * vendor.stock;
      price += this.getPrice(r.id, count - vendor.stock);
    } else {
      price = vendor.price * count;
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
    if (!recipe.professionId) {
      SharedService.recipesForUser[recipe.id] = ['Item'];
    }

    // For intermediate crafting
    if (SharedService.recipesForUser[recipe.icon]) {
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
        result.cost += this.getPrice(r.id, r.quantity * quantity);
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
    const item: ItemNpcDetails = NpcService.itemNpcMap.value.get(id);
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
      const knownRecipe: Recipe = SharedService.recipesMapPerItemKnown[reagent.id];
      if (this.shouldUseIntermediateForReagent(knownRecipe, reagent) && !this.getOverridePrice(reagent.id)) {
        reagent.intermediateEligible = true;
        reagent.intermediateCount = reagent.quantity;
        recipe.cost += knownRecipe.cost * reagent.quantity;
      } else {
        reagent.intermediateEligible = false;
        reagent.intermediateCount = 0;
        recipe.cost += reagent.avgPrice * (reagent.quantity / recipe.procRate);
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
