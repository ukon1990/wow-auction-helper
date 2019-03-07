import {Recipe} from '../models/crafting/recipe';
import {SharedService} from '../services/shared.service';
import {TSM} from '../models/auction/tsm';
import {Item} from '../models/item/item';

export class SummaryUtil {
  public static isProfitMatch(recipe: Recipe): boolean {
    if (!recipe) {
      return false;
    }
    return recipe.roi / recipe.cost > .1;
  }

  public static isProfitAndDailySoldMatch(recipe: Recipe): boolean {
    const tsm = (SharedService.tsm[recipe.itemID] as TSM);
    if (!tsm) {
      return false;
    }

    return SummaryUtil.isProfitMatch(recipe) &&
      recipe.avgDailySold >= 5 && recipe.regionSaleRate > .15;
  }

  public static getProfessionNameFromRecipe(recipe: Recipe): string {
    return recipe.profession ? recipe.profession : 'On use';
  }

  public static isCurrentExpansionMatch(itemID: number, onlyCurrentExpansion: boolean) {
    if (onlyCurrentExpansion) {
      return SummaryUtil.getItem(itemID).expansionId === 7;
    }
    return true;
  }

  public static getItem(id: number): Item {
    return SharedService.items[id] ?
      SharedService.items[id] : new Item();
  }

  public static isUnrakedOrRank3(recipe: Recipe): boolean {
    return !recipe.rank || recipe.rank === '' || recipe.rank === '3';
  }
}
