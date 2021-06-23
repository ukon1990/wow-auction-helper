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
import {ItemDroppedByRow} from '../../item/models/item-dropped-by-row.model';
import {Item, ItemInventory} from '../../../models/item/item';
import {millingRecipeMap, ProspectingAndMillingUtil, prospectingRecipeMap} from '../../../utils/prospect-milling.util';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    NEEDED: 1,
    PESSIMISTIC: 2
  };
  static readonly STRATEGY_LIST = [
    {
      id: 0,
      name: 'Optimistic',
      description: 'Uses a straight up calculation on the lowest prices per item * quantity needed.'
    },
    {
      id: 1,
      name: 'Needed',
      description: 'Calculates the cost blindly based on what the price was as of the AH snapshot. ' +
        'If there are not enough of a reagent at a given price point, it will go up to the next' +
        'until the price is calculated for the needed reagent quantity.'
    },
    {
      id: 2,
      name: 'Pessimistic',
      description: 'Same as the "Needed" strategy, but in addition. It will attempt to take potential ' +
        'price bait in to consideration.\n\n' +
        'Eg: So if someone posts a couple items up, for a price that is way cheaper than the ' +
        'majority of prices for that item. It will skip to the next price. ' +
        'This will probably be more of an accurate estimate, especially for highly populated realms.'
    }
  ];
  private static intermediateEligible: Recipe[] = [];
  private static intermediateMap: Map<number, Recipe> = new Map();
  private static hasMappedRecipes: boolean;

  private ahCutModifier = 0.95;
  private baseSource = {
    id: undefined,
    quantity: 0,
    price: 0,
    sumPrice: 0,
  };

  protected constructor(
    public map: Map<string, AuctionItem>,
    public variations: Map<number, AuctionItem[]>,
    public items: Map<number, Item>,
    public faction: number,
    public useIntermediateCrafting: boolean = false,
    public useInventory: boolean = false
  ) {
  }

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
    this.setReagentBaseSources(reagent);
    let price;
    const vendor = this.getVendorPriceDetails(reagent.id),
      overridePrice = this.getOverridePrice(reagent.id),
      tradeVendorPrice = this.getTradeVendorPrice(reagent.id),
      inventory = this.getInventory(reagent.id);
    let quantity = reagent.quantity / recipe.procRate;

    if (inventory && this.useInventory) {
      let fromInventory = 0;
      if (inventory.quantity >= quantity) {
        fromInventory = quantity;
      } else {
        fromInventory = inventory.quantity;
      }

      reagent.sources.inventory = {
        id: inventory.id,
        quantity: fromInventory,
        price: inventory.buyout,
        sumPrice: inventory.buyout * fromInventory,
        list: inventory.characters,
      };

      quantity = quantity - fromInventory;
    }
    if (overridePrice) {
      price = overridePrice.price * quantity;
      reagent.sources.override = {
        price: overridePrice.price,
        quantity: quantity,
        sumPrice: quantity * overridePrice.price,
      };
    } else if (vendor && vendor.price && !vendor.stock) {
      const {price: sumPrice, vendorPrice, vendorQuantity} = this.getCostFromVendor(vendor, reagent, quantity);
      price = sumPrice;
      reagent.sources.vendor = {
        quantity: vendorQuantity,
        price: vendorPrice,
        sumPrice: vendorQuantity * vendorPrice
      };
      const restQuantity = quantity - reagent.sources.vendor.quantity;
      if (restQuantity) {
        reagent.sources.ah = {
          price,
          quantity: restQuantity,
          sumPrice: restQuantity * price,
        };
      }
    } else if (tradeVendorPrice) {
      price = tradeVendorPrice * quantity;
      reagent.sources.tradeVendor = {
        quantity: quantity,
        price: tradeVendorPrice,
        sumPrice: quantity * tradeVendorPrice,
      };
    } else {
      price = this.getPrice(reagent.id, quantity);
      reagent.sources.ah = {
        price: price / quantity,
        quantity: quantity,
        sumPrice: price,
      };
    }
    if (!price) {
      const fallback = this.getFallbackPrice(reagent.id, quantity);
      const droppedFrom = this.getDroppedFrom(reagent);
      price = fallback.cost;
      reagent.intermediateEligible = fallback.intermediateEligible;

      if (droppedFrom) {
        reagent.sources.farm = {
          price: 0,
          sumPrice: 0,
          quantity: quantity,
          list: droppedFrom,
        };
      }
    }
    reagent.avgPrice = price / quantity;
    reagent.sumPrice = price;
    recipe.cost += price;
  }

  private getDroppedFrom(reagent: Reagent): ItemDroppedByRow[] {
    const details: ItemNpcDetails = NpcService.itemNpcMap.value.get(reagent.id);
    if (details && details.droppedBy) {
      return details.droppedBy;
    }
    return undefined;
  }

  private setReagentBaseSources(reagent: Reagent) {
    if (!reagent.sources) {
      reagent.sources = {
        override: {...this.baseSource},
        vendor: {...this.baseSource},
        tradeVendor: {...this.baseSource},
        ah: {...this.baseSource},
        farm: {...this.baseSource},
        intermediate: {...this.baseSource},
        inventory: {...this.baseSource},
      };
    }
  }

  private setROI(recipe: Recipe) {
    if (millingRecipeMap[recipe.id]) {
      const id = recipe.reagents[0].id;
      const milling = ProspectingAndMillingUtil.millsSourceMap.get(id);
      if (milling) {
        recipe.roi = milling.yield * recipe.reagents[0].quantity;
        return;
      }
    }
    if (prospectingRecipeMap[recipe.id]) {
      const id = recipe.reagents[0].id;
      const prospecting = ProspectingAndMillingUtil.prospectingSourceMap.get(id);
      if (prospecting) {
        recipe.roi = prospecting.yield * recipe.reagents[0].quantity;
        return;
      }
    }
    recipe.roi = (recipe.buyout * this.ahCutModifier) - recipe.cost;
  }

  private resetRecipePriceValues(recipe: Recipe) {
    recipe.cost = 0;
    recipe.roi = 0;
    recipe.buyout = 0;
  }

  private setRecipeForReagent(r: Reagent, parentRecipe: Recipe) {
    const recipe: Recipe[] = CraftingService.itemRecipeMapPerKnown.value.get(r.id);
    if (!r.recipe && recipe) {
      if (!BaseCraftingUtil.intermediateMap.get(parentRecipe.id)) {
        BaseCraftingUtil.intermediateEligible.push(parentRecipe);
        BaseCraftingUtil.intermediateMap.set(parentRecipe.id, parentRecipe);
      }
    }
  }

  private getCostFromVendor(vendor: { price: number; stock: number }, r: Reagent, count: number): {
    vendorQuantity: number;
    vendorPrice: number;
    price: number;
  } {
    let price = 0;
    let vendorQuantity = count;
    const vendorPrice = vendor.price;
    if (vendor && vendor.stock && vendor.stock < count) {
      vendorQuantity = vendor.stock;
      price = vendor.price * vendor.stock;
      price += this.getPrice(r.id, count - vendor.stock);
    } else {
      price = vendor.price * count;
    }
    return {price, vendorQuantity, vendorPrice};
  }

  private setRecipePriceAndStatData(recipe: Recipe) {
    // const auctionItem: AuctionItem = this.map.get('' + recipe.itemID);
    const variationMatch = this.variations.get(recipe.craftedItemId);
    let auctionItem: AuctionItem = variationMatch ? variationMatch[0] : undefined;
    if (recipe.bonusIds && recipe.bonusIds.length) {
      const variationsForId = this.variations.get(recipe.craftedItemId);
      (variationsForId || []).forEach((variation) => {
        if (variation && variation.bonusIds) {
          variation.bonusIds.forEach(id => {
            if (recipe.bonusIds.filter(bId => bId === id).length) {
              auctionItem = variation;
            }
          });
        }
      });
    }
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
      CraftingService.recipesForUser.value.set(recipe.itemID, ['Item']);
    }

    // For intermediate crafting
    /*
    if (CraftingService.recipesForUser.value.has(recipe.id)) {
      if (!SharedService.recipesMapPerItemKnown[recipe.itemID] || SharedService.recipesMapPerItemKnown[recipe.itemID].cost > recipe.cost) {
        SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
      }
    }*/
  }

  getFallbackPrice(id: number, quantity: number): { cost: number, intermediateEligible: boolean } {
    const result = {
      cost: 0,
      intermediateEligible: false
    };
    const item: AuctionItem = this.map.get('' + id),
      recipe: Recipe[] = CraftingService.itemRecipeMapPerKnown.value.get(id);
    if (recipe) {
      recipe[0].reagents.forEach(r => {
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
    const npcItem: ItemNpcDetails = NpcService.itemNpcMap.value.get(id);
    const item: Item = this.items ? this.items.get(id) : undefined;
    if (item && item.buyPrice && npcItem && npcItem.vendorBuyPrice && npcItem.vendorAvailable === 0) {
      const stock = npcItem
        ? npcItem.vendorAvailable < 0
          ? 0 : npcItem.vendorAvailable
        : 0;
      const price = item.buyPrice ?
        item.buyPrice
        : npcItem ?
          npcItem.vendorBuyPrice : undefined;
      return {
        price,
        stock
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
      const knownRecipes: Recipe[] = (CraftingService.itemRecipeMapPerKnown.value.get(reagent.id) || [])
        .filter(r => r.roi > 0)
        .sort((a, b) => a.cost - b.cost);
      if (
        knownRecipes &&
        this.shouldUseIntermediateForReagent(knownRecipes[0], reagent) &&
        !this.getOverridePrice(reagent.id)
      ) {
        reagent.intermediateEligible = true;
        reagent.intermediateCount = reagent.quantity;
        reagent.recipe = knownRecipes[0];
        recipe.cost += knownRecipes[0].cost * reagent.quantity;
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
      knownRecipe.cost < reagent.avgPrice && this.useIntermediateCrafting;
  }

  private isNotMillingOrProspecting(knownRecipe: Recipe) {
    return !TextUtil.contains(knownRecipe.name, 'mass mill') &&
      !TextUtil.contains(knownRecipe.name, 'mass prospect');
  }

  private getInventory(id: number): ItemInventory {
    const item = this.items.get(id);
    if (item && item.inventory && item.inventory[this.faction]) {
      return item.inventory[this.faction];
    }
    return undefined;
  }
}
