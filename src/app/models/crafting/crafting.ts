import { Recipe } from './recipe';
import { SharedService } from '../../services/shared.service';
import { Item } from '../item/item';
import { AuctionItem } from '../auction/auction-item';
import { CraftingService } from '../../services/crafting.service';
import { CustomProcs } from './custom-proc';
import { ItemSpells } from '../item/itemspells';
import { Spell } from '../spell';
import { Reagent } from './reagent';
import wordsToNumbers from 'words-to-numbers';

export class Crafting {
  public static ahCutModifier = 0.95;

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

    if (missingRecipes.length > 100) {
      craftingService.addRecipes(missingRecipes);
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
      tmpList = tmpList.concat(Crafting.getItemForSpellsThatAreRecipes(i)));

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
          recipe.name = `${ name.indexOf('Create') === -1 ? 'Create ' : ''}${ name }`;
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
        const re = SharedService.recipesMapPerItemKnown[r.itemID];
        // If this is a intermediate craft
        if (SharedService.user.useIntermediateCrafting && re) {
          if (re.reagents.length > 0) {
            let tmpCost = 0;
            const regularCost = this.getCost(r.itemID, r.count) / CustomProcs.get(recipe);
            re.reagents.forEach(rea => {
              tmpCost += this.getCost(rea.itemID, rea.count) / CustomProcs.get(re) * r.count;
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
          recipe.cost += this.getCost(r.itemID, r.count) / CustomProcs.get(recipe);
        }
      });

      // Adding AH cut
      recipe.cost = recipe.cost;
      // Doing the cost math
      recipe.roi = this.getROI(recipe.cost, SharedService.auctionItemsMap[recipe.itemID]) * Crafting.ahCutModifier;
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
      return (SharedService.customPricesMap[itemID].price * count);
    } else if (Crafting.isVendorCheaperThanAH(itemID)) {
      return (SharedService.items[itemID] as Item).buyPrice * count;
    } else if (SharedService.tradeVendorItemMap[itemID] && SharedService.tradeVendorMap[itemID].useForCrafting) {
      return (SharedService.tradeVendorItemMap[itemID].value * count);
    } else if (SharedService.auctionItemsMap[itemID] && !Crafting.isBelowMktBuyoutValue(itemID)) {
      return SharedService.auctionItemsMap[itemID].buyout * count;
    } else if (Crafting.existsInTSM(itemID)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return (SharedService.tsm[itemID].MarketValue * count);
    }
    return 0;
  }

  public static isVendorCheaperThanAH(itemID: number): boolean {
    if (SharedService.items[itemID].isBoughtForGold) {
      if (!SharedService.auctionItemsMap[itemID]) {
        return true;
      } else if (SharedService.items[itemID].buyPrice < SharedService.auctionItemsMap[itemID].buyout) {
        return true;
      }

    }
    return false;
  }

  /*
  public static getReagentCraftCost(itemID: number, count: number): number {
    return
  }*/

  private static existsInTSM(itemID: number): boolean {
    return SharedService.user.apiToUse !== 'none' && SharedService.tsm[itemID];
  }

  private static isBelowMktBuyoutValue(itemID: number): boolean {
    return Crafting.existsInTSM(itemID) && SharedService.auctionItemsMap[itemID].buyout /
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
