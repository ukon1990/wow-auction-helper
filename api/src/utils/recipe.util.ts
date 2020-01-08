import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {HttpClientUtil} from './http-client.util';
import {WoWHeadUtil} from './wowhead.util';
import {GameBuild} from '../../../client/src/client/utils/game-build.util';

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

  static getRecipeListForPatch(patchNumber: number): Promise<Recipe[]> {
    const professions = GameBuild.professions;
    return new Promise<any>((resolve, reject) => {
      Promise.all(professions.map(profession =>
        this.getRecipeListForPatchAndProfession(patchNumber, profession)))
        .then((lists) => {
          let recipes = [];
          lists.forEach(r => recipes = [...recipes, ...r]);
          resolve(recipes);
        })
        .catch(reject);
    });
  }

  static getRecipeListForPatchAndProfession(patchNumber: number, profession: string): Promise<Recipe[]> {
    return new Promise<Recipe[]>((resolve, reject) => {
      const urlName = profession === 'Cooking' ? `cooking-recipe` : profession;
      const url = `https://ptr.wowhead.com/${
        urlName.toLocaleLowerCase()}-spells?filter=21;2;${patchNumber}`;
      new HttpClientUtil().get(url, false)
        .then(async ({body}) => {
          const list = WoWHeadUtil.getArrayVariable('listviewspells', body);
          resolve(this.mapResultToRecipe(list, profession));
        })
        .catch((error) => {
          console.log(error);
          resolve([]);
        });
    });
  }

  private static async mapResultToRecipe(list, profession) {
    const recipes = [];
    for (const recipe of list) {
      const {id, creates, name, reagents} = recipe;
      let rank: number;
      try {
        await this.getRankForRecipe(id)
          .then(r => rank = r)
          .catch(console.error);
      } catch (e) {
        console.error(e);
      }
      const minCount = creates[1],
        maxCount = creates[1];
      recipes.push({
        spellID: id,
        itemID: creates[0],
        name,
        minCount: minCount ? minCount : 1,
        maxCount: maxCount ? maxCount : 1,
        rank,
        profession,
        reagents: reagents.map(reagent => ({
          itemID: reagent[0],
          name: '',
          count: reagent[1],
          dropped: undefined
        })),
        expansion: 8
      });
    }
    return recipes;
  }

  private static getRankForRecipe(id: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      new HttpClientUtil().get(`https://www.wowhead.com/tooltip/spell/${id}?locale=en`)
        .then(({body}) => {
          const regexResult = (/Rank [\d]{0,1}/g).exec(body.tooltip);
          let rank;
          if (regexResult && regexResult[0]) {
            rank = +regexResult[0].replace(/Rank /g, '');
          }
          resolve(rank);
        })
        .catch(() => resolve(undefined));
    });
  }
}
