import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {HttpClientUtil} from './http-client.util';
import {WoWHeadUtil} from './wowhead.util';
import {GameBuild} from '../../../client/src/client/utils/game-build.util';
import {languages} from '../static-data/language.data';
import {ItemLocale} from '../models/item/item-locale';

export class RecipeUtil {

  private static slugifyString(realm: string): string {
    return realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase();
  }

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

  static getRecipeListForPatch(patchNumber: number, gameVersion?: string): Promise<Recipe[]> {
    const professions = gameVersion ? GameBuild.professionsClassic : GameBuild.professions;
    return new Promise<any>((resolve, reject) => {
      Promise.all(professions.map(profession =>
        this.getRecipeListForPatchAndProfession(patchNumber, profession, gameVersion)))
        .then((lists) => {
          let recipes = [];
          lists.forEach(r => recipes = [...recipes, ...r]);
          resolve(recipes);
        })
        .catch(reject);
    });
  }

  static getRecipeListForPatchAndProfession(patchNumber: number, profession: string, gameVersion?: string): Promise<Recipe[]> {
    return new Promise<Recipe[]>((resolve, reject) => {
      const urlName = this.getUrlName(this.slugifyString(profession), gameVersion);
      const url = this.getUrl(gameVersion, urlName, patchNumber);
      console.log(url);
      new HttpClientUtil().get(url, false)
        .then(async ({body}) => {
          const list = this.getList(gameVersion, body);
          console.log(profession, list.length);
          resolve(this.mapResultToRecipe(list, profession, gameVersion));
        })
        .catch((error) => {
          console.log(error);
          resolve([]);
        });
    });
  }

  private static getList(gameVersion: string, body) {
    return gameVersion ?
      WoWHeadUtil.getNewListViewData(body, 'spell', 'recipes') :
      WoWHeadUtil.getArrayVariable('listviewspells', body);
  }

  private static getUrlName(profession: string, gameVersion: string) {
    return profession.toLowerCase() === 'cooking' && !gameVersion ? `cooking-recipe` : profession;
  }

  private static getUrl(gameVersion: string, urlName: string, patchNumber: number) {
    return `https://${gameVersion ? gameVersion : 'ptr'}.wowhead.com/${
      urlName.toLocaleLowerCase()}${!gameVersion ? '-spells' : ''}?filter=21;2;${patchNumber}`;
  }

  private static async mapResultToRecipe(list, profession: string, gameVersion?: string) {
    const recipes = [];
    for (const recipe of list) {
      const {id, creates, name, reagents} = recipe;
      await this.setRankAndNameForRecipe(id, gameVersion, recipe);

      const minCount = creates ? creates[1] : 1,
        maxCount = creates ? creates[1] : 1;
      recipes.push({
        spellID: id,
        itemID: creates ? creates[0] : -1,
        name: recipe.name,
        minCount: minCount ? minCount : 1,
        maxCount: maxCount ? maxCount : 1,
        rank: recipe.rank,
        profession,
        reagents: reagents ? reagents.map(reagent => ({
          itemID: reagent[0],
          name: '',
          count: reagent[1],
          dropped: undefined
        })) : [],
        expansion: gameVersion ? 1 : 8
      });
    }
    return recipes;
  }

  private static async setRankAndNameForRecipe(id: number, gameVersion: string = '', recipe): Promise<any> {
    recipe.name = new ItemLocale();
    for (const language of languages) {
      await this.getRecipeTooltip(id, language, gameVersion, recipe);
    }
    return recipe;
  }

  private static async getRecipeTooltip(id, language, gameVersion: string, recipe) {
    await new Promise<number>((resolve, reject) => {
      new HttpClientUtil().get(
        `https://${gameVersion ? gameVersion : 'www'}.wowhead.com/tooltip/spell/${id}?locale=${language.key}`)
        .then(({body}) => {
          if (language.key === 'en') {
            const regexResult = (/Rank [\d]{0,1}/g).exec(body.tooltip);
            if (regexResult && regexResult[0]) {
              recipe.rank = +regexResult[0].replace(/Rank /g, '');
            }
          }

          for (const locale of language.locales) {
            recipe.name[locale] = body.name;
          }

          resolve();
        })
        .catch(() => resolve());
    });
  }
}
