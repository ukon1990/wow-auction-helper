import {CraftingFormFilterModel} from '../models/crafting-form-filter.model';
import {CraftingService} from '../../../services/crafting.service';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {Filters} from '../../../utils/filtering';
import {Recipe} from '../models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {TextUtil} from '@ukon1990/js-utilities';
import {SharedService} from '../../../services/shared.service';
import {AuctionsService} from '../../../services/auctions.service';
import {RealmService} from '../../../services/realm.service';
import {SettingsService} from '../../user/services/settings/settings.service';
import {GameBuild} from '@shared/utils';
import {ItemStats} from '@shared/models';

interface RecipeTable extends Recipe {
  priceAvg24: number;
  priceTrend: number;
  regionSaleRate: number;
  past60DaysSaleRate: number;
  inventoryQuantity: number;
}

export class CraftingFilterUtil {
  constructor(
    private service: AuctionsService,
    private realmService: RealmService,
    private settingsService: SettingsService,
  ) {
  }

  /**

   * Setting the expansion here in case a user changes between retail and classic while
   * on the recipes page

   // this.isClassic = this.realmService.isClassic;
   this.setExpansions();
   */

  private filter(recipe: Recipe, changes: CraftingFormFilterModel) {
    if (!EmptyUtil.isNullOrUndefined(recipe)) {
      return this.isKnownRecipe(recipe, changes.onlyKnownRecipes)
        && this.isNameMatch(recipe, changes.searchQuery)
        && Filters.isProfitMatch(recipe, undefined, changes.profit)
        && Filters.isPersonalSaleRateMatch(recipe.itemID, changes.demand, false)
        && Filters.isXSmallerThanOrEqualToY(changes.demand, recipe.regionSaleRate)
        && Filters.isXSmallerThanOrEqualToY(changes.rank, recipe.rank)
        && Filters.isDailySoldMatch(recipe.itemID, changes.minSold, false)
        && Filters.recipeIsProfessionMatch(recipe.id, changes.professionId)
        && Filters.isItemClassMatch(recipe.itemID, changes.itemClass, changes.itemSubClass)
        && Filters.isExpansionMatch(recipe.itemID, changes.expansion, this.realmService.isClassic);
    }
    return false;
  }

  private map(recipe: Recipe): RecipeTable {
    let stats: ItemStats[] = [];
    let faction = 0;
    let stat;
    let past60DaysSaleRate = 0;
    let inventoryQuantity = 0;
    const item: AuctionItem[] = this.service.mappedVariations.value.get(recipe.craftedItemId);

    if (item) {
      stats = this.service.statsVariations.value.get(recipe.craftedItemId);
      faction = this.settingsService.settings.value.faction || 0;
      stat = this.getStatsForItem(item, stats);
      past60DaysSaleRate = this.getPersonalSaleRateForitem(item);
      inventoryQuantity = this.getInventoryQuantityForItemAndFaction(item, faction);
    }

    return {
      ...recipe,
      priceAvg24: stat ? stat.past24Hours.price.avg : 0,
      priceTrend: stat ? stat.past7Days.price.trend : 0,
      regionSaleRate: stat && stat.tsm?.salePct ? stat.tsm?.salePct : 0,
      past60DaysSaleRate,
      inventoryQuantity,
    };
  }

  getFilteredRecipes(changes: CraftingFormFilterModel): any[] {
    return CraftingService.list.value
      .filter(recipe => this.filter(recipe, changes))
      .map(this.map);
  }

  isNameMatch(recipe: Recipe, name: string): boolean {
    if (EmptyUtil.isNullOrUndefined(name)) {
      return true;
    }
    if (TextUtil.contains(recipe.name, name)) {
      return true;
    }
    const item = SharedService.items[recipe.itemID];
    return item && TextUtil.contains(item.name, name);
  }

  setExpansions(): string[] {
    return GameBuild.expansionMap.filter((v, index) => {
      if (this.realmService.isClassic) {
        return index <= GameBuild.latestClassicExpansion;
      }
      return true;
    });
  }

  private getStatsForItem(item: AuctionItem[], stats: ItemStats[]) {
    return (item[0] && item[0].stats) || (stats && stats[0]) ?
      item[0].stats || stats[0] : undefined;
  }

  private getPersonalSaleRateForitem(item: AuctionItem[]) {
    return item[0] && item[0].past60DaysSaleRate ? item[0].past60DaysSaleRate : 0.001;
  }

  private getInventoryQuantityForItemAndFaction(item: AuctionItem[], faction: number) {
    return item[0] && item[0].item && item[0].item.inventory ?
      item[0].item.inventory[faction] ? item[0].item.inventory[faction].quantity : 0
      : 0;
  }

  isKnownRecipe(recipe: Recipe, onlyKnownRecipes: boolean): boolean {
    return !onlyKnownRecipes ||
      CraftingService.recipesForUser.value.has(recipe.id)
      || !recipe.professionId;
  }
}