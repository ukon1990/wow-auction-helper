import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CraftingService} from '../../../services/crafting.service';
import {ItemSpells} from '../../../models/item/itemspells';
import {Spell} from '../../../models/spell';
import {Reagent} from '../models/reagent';
import wordsToNumbers from 'words-to-numbers';
import {CustomProcUtil} from './custom-proc.util';
import {Filters} from '../../../utils/filtering';
import {NpcService} from '../../npc/services/npc.service';
import {PessimisticCraftingUtil} from './pessimistic-crafting.util';
import {BaseCraftingUtil} from './base-crafting.util';
import {OptimisticCraftingUtil} from './optimistic-crafting.util';
import {NeededCraftingUtil} from './needed-crafting.util';
import {Report} from '../../../utils/report.util';

export class CraftingUtil {
  public static ahCutModifier = 0.95;
  public static strategy: BaseCraftingUtil;

  public static checkForMissingRecipes(craftingService: CraftingService): void {
    const missingRecipes = [];
    Object.keys(SharedService.recipesForUser).forEach(key => {
      try {
        if (!SharedService.recipesMap[key]) {
          missingRecipes.push(parseInt(key, 10));
        }
      } catch (e) {
        console.error('checkForMissingRecipes failed', e);
      }
    });

    if (missingRecipes.length < 100) {
      craftingService.addRecipes(missingRecipes);
    } else {
    }
  }

  /**
   * Checks all items for possible create effects
   *
   * PS: Another wastefull function, I hope that this does not impact performance too much...
   * @static
   * @memberof Crafting
   */
  public static setOnUseCraftsWithNoReagents(): void {
    let tmpList = [];
    SharedService.itemsUnmapped.forEach(i =>
      tmpList = tmpList.concat(CraftingUtil.getItemForSpellsThatAreRecipes(i)));

    tmpList.forEach(recipe => {
      SharedService.recipes.push(recipe);
      SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
    });
  }

  /**
   * Generating recipes from spell text and spell ID
   *
   * @static
   * @param {Item} item
   * @returns {Recipe[]}
   * @memberof Crafting
   */
  public static getItemForSpellsThatAreRecipes(item: Item): Recipe[] {
    const list: Recipe[] = [];
    if (item.itemClass === 7 && item.itemSpells !== null &&
      item.itemSpells && item.itemSpells.length > 0) {
      item.itemSpells.forEach((spell: ItemSpells) => {
        if (SharedService.recipesMap[spell.SpellID]
          && SharedService.recipesMap[spell.SpellID].itemID &&
          SharedService.recipesMap[spell.SpellID].reagents) {

          const recipe = new Recipe(),
            reagent = new Reagent(),
            originalRecipe: Recipe = SharedService.recipesMap[spell.SpellID],
            name = SharedService.items[originalRecipe.itemID].name,
            regex = new RegExp(/[0-9]{1,}/gi);

          if (originalRecipe.reagents && originalRecipe.reagents.length > 1) {
            return;
          }

          const numbers = regex.exec(wordsToNumbers(spell.Text) + ''),
            count = numbers !== null && numbers.length > 0 && numbers[0] ? parseInt(numbers[0], 10) : 1,
            createCount = numbers !== null && numbers.length > 1 && numbers[1] ? parseInt(numbers[1], 10) : 1;

          recipe.spellID = spell.SpellID;
          recipe.name = `${name.indexOf('Create') === -1 ? 'Create ' : ''}${name}`;
          recipe.itemID = originalRecipe.itemID;
          recipe.minCount = createCount;
          recipe.maxCount = createCount;
          reagent.itemID = item.id;
          reagent.name = item.name;
          reagent.count = count;
          recipe.reagents = [];
          recipe.reagents.push(reagent);

          if (originalRecipe.reagents.length === 0 || originalRecipe.flaggedAsBugged) {
            originalRecipe.reagents = recipe.reagents;
            originalRecipe.minCount = recipe.minCount;
            originalRecipe.maxCount = recipe.maxCount;
          } else {
            list.push(recipe);
          }
        }
      });
    }
    return list;
  }

  public static calculateCost(strategyHasChanged = false): void {
    const STRATEGY = BaseCraftingUtil.STRATEGY,
      selectedStrategy = SharedService.user.craftingStrategy;
    if (!this.strategy || strategyHasChanged) {
      switch (selectedStrategy) {
        case STRATEGY.OPTIMISTIC:
          this.strategy = new OptimisticCraftingUtil();
          break;
        case STRATEGY.PESSIMISTIC:
          this.strategy = new PessimisticCraftingUtil();
          break;
        default:
          this.strategy = new NeededCraftingUtil();
          break;
      }
      Report.send(
        'calculateCost',
        'CraftingUtil',
        'Calculated with strategy: ' + BaseCraftingUtil.STRATEGY_LIST[selectedStrategy].name);
    }

    this.strategy.calculate(SharedService.recipes);
  }

  private static costForRecipe(recipe: Recipe, strategy: BaseCraftingUtil): void {
    if (recipe === null || recipe === undefined) {
      return;
    }

    try {
      /*
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
        const re = SharedService.recipesMapPerItemKnown[r.itemID];
        // If this is a intermediate craft
        if (SharedService.user.useIntermediateCrafting && re) {
          if (re.reagents.length > 0) {
            let tmpCost = 0;
            const regularCost = this.getCost(r.itemID, r.count) / CustomProcUtil.get(recipe);
            re.reagents.forEach(rea => {
              tmpCost += this.getCost(rea.itemID, rea.count) / CustomProcUtil.get(re) * r.count;
            });

            if (tmpCost < regularCost) {
              recipe.cost += tmpCost;
              r.intermediateEligible = true;
              r.recipe = re;
            } else {
              recipe.cost += regularCost;
            }
          }
        } else {
          recipe.cost += this.getCost(r.itemID, r.count) / CustomProcUtil.get(recipe);
        }
      });

      // Adding AH cut
      recipe.cost = recipe.cost;
      // Doing the cost math
      recipe.roi = this.getROI(recipe.cost, SharedService.auctionItemsMap[recipe.itemID]) * CraftingUtil.ahCutModifier;*/
    } catch (e) {
      console.error('Calc issue with recipe', e, recipe);
    }
  }

  public static getCost(itemID: number, count: number): number {
    if (SharedService.customPricesMap && SharedService.customPricesMap[itemID]) {
      return (SharedService.customPricesMap[itemID].price * count);
    } else if (CraftingUtil.isVendorCheaperThanAH(itemID)) {
      return this.getNeededBuyPriceFromVendor(itemID, count);
    } else if (SharedService.tradeVendorItemMap[itemID] && SharedService.tradeVendorMap[itemID].useForCrafting) {
      return (SharedService.tradeVendorItemMap[itemID].value * count);
    } else if (SharedService.auctionItemsMap[itemID] && !CraftingUtil.isBelowMktBuyoutValue(itemID)) {
      return SharedService.auctionItemsMap[itemID].buyout * count;
    } else if (CraftingUtil.existsInTSM(itemID)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return (SharedService.tsm[itemID].MarketValue * count);
    }
    return 0;
  }

  private static getNeededBuyPriceFromVendor(itemID: number, count: number) {
    const itemNpcDetails = SharedService.itemNpcMap.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.vendorAvailable > 0 && itemNpcDetails.vendorAvailable < count) {
        return itemNpcDetails.vendorBuyPrice * itemNpcDetails.vendorAvailable +
          (SharedService.auctionItemsMap[itemID] ?
            SharedService.auctionItemsMap[itemID].buyout * (count - itemNpcDetails.vendorAvailable) : 0);
      }
      return (itemNpcDetails.vendorBuyPrice * count);
    }
    return 0;
  }

  public static isVendorCheaperThanAH(itemID: number): boolean {
    const itemNpcDetails = SharedService.itemNpcMap.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.soldBy.length && SharedService.user.useVendorPriceForCraftingIfAvailable) {
        if (!SharedService.auctionItemsMap[itemID]) {
          return true;
        } else if (itemNpcDetails.vendorBuyPrice < SharedService.auctionItemsMap[itemID].buyout) {
          return true;
        }
      }
    }
    return false;
  }

  private static getItem(itemID: number): Item {
    return SharedService.items[itemID];
  }

  /*
    public static getReagentCraftCost(itemID: number, count: number): number {
      return
    }*/

  private static existsInTSM(itemID: number): boolean {
    return Filters.isUsingAPI() && SharedService.tsm[itemID];
  }

  private static isBelowMktBuyoutValue(itemID: number): boolean {
    return CraftingUtil.existsInTSM(itemID) && SharedService.auctionItemsMap[itemID].buyout /
      SharedService.tsm[itemID].MarketValue * 100 >=
      SharedService.user.buyoutLimit;
  }

  private static getROI(cost: number, item?: AuctionItem) {
    if (!item) {
      return 0;
    }
    return item.buyout - cost;
  }
}
