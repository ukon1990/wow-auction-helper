import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {HttpClientUtil} from './http-client.util';
import {WoWHeadUtil} from './wowhead.util';

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
    const professions = [
      {key: 'enchanting', name: 'Enchanting'},
      {key: 'alchemy', name: 'Alchemy'},
    ];
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

  static getRecipeListForPatchAndProfession(patchNumber: number, {key, name}: {key, name}): Promise<Recipe[]> {
    return new Promise<Recipe[]>((resolve, reject) => {
      new HttpClientUtil().get(`https://ptr.wowhead.com/${key}-spells?filter=21;2;${patchNumber}`, false)
        .then(async ({body}) => {
          const list = this.getSpellList(body);
          resolve(await this.mapResultToRecipe(list, name));
        })
        .catch(reject);
    });
  }

  private static async mapResultToRecipe(list, profession) {
    const recipes = [];
    for (const recipe of list) {
      const {id, creates, name, reagents} = recipe;
      const rank: number = await this.getRankForRecipe(id);
      recipes.push({
        spellID: id,
        itemID: creates[0],
        name,
        minCount: creates[1],
        maxCount: creates[2],
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

  private static getSpellList(body: string) {
    const regex = /var listviewspells = \[([\s\S]*?)];/gm,
      result = regex.exec(body);
    try {
      if (result && result[0]) {
        // tslint:disable-next-line:no-eval
        return eval(result[0]
          .replace(/var listviewspells =/g, '')
          .replace(/;$/g, ''));
      }
    } catch (e) {

    }
    return [];
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
