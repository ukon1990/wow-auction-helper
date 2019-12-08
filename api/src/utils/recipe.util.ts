import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';

export class RecipeUtil {
  public static convert(wowDB): Recipe {
    const basePoints = wowDB.Effects[0].BasePoints;
    return {
      spellID: wowDB.ID,
      itemID: wowDB.CreatedItemID,
      name: wowDB.Name,
      profession: 'none',
      rank: wowDB.Rank,
      minCount: basePoints > 0 ? basePoints : 1,
      maxCount: basePoints > 0 ? basePoints : 1,
      reagents: RecipeUtil.convertReagents(wowDB.Reagents)
    } as Recipe;
  }

  public static convertReagents(reagents: any[]): Reagent[] {
    const r = [];
    reagents.forEach(reagent => {
      r.push({itemID: reagent.Item, name: '', count: reagent.ItemQty, dropped: false});
    });
    return r;
  }
}
