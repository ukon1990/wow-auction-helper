import {Recipe} from '../modules/crafting/models/recipe';
import {SharedService} from '../services/shared.service';
import {Item} from '@shared/models';
import {Profession} from '@shared/models/profession/profession.model';
import {TsmService} from '../modules/tsm/tsm.service';

export class SummaryUtil {
  public static isProfitMatch(recipe: Recipe): boolean {
    if (!recipe) {
      return false;
    }
    return recipe.roi / recipe.cost > .1;
  }

  public static isProfitAndDailySoldMatch(recipe: Recipe): boolean {
    const tsm = TsmService.getById(recipe.itemID);
    if (!tsm) {
      return false;
    }

    return SummaryUtil.isProfitMatch(recipe) &&
      recipe.avgDailySold >= 5 && recipe.regionSaleRate > .15;
  }

  public static getProfessionNameFromRecipe(recipe: Recipe, professionMap: Map<number, Profession>): string {
    return professionMap.has(recipe.professionId) ?
      professionMap.get(recipe.professionId).name : 'On use';
  }

  public static isCurrentExpansionMatch(itemID: number, onlyCurrentExpansion: boolean) {
    if (onlyCurrentExpansion) {
      return SummaryUtil.getItem(itemID).expansionId === 8;
    }
    return true;
  }

  public static getItem(id: number): Item {
    return SharedService.items[id] ?
      SharedService.items[id] : new Item();
  }

  public static isUnrakedOrRank3(recipe: Recipe): boolean {
    return !recipe.rank || recipe.rank === 3;
  }
}