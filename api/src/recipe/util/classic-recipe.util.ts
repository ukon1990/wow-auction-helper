/*
import {Recipe} from '../models/crafting/recipe';
import {Reagent} from '../models/crafting/reagent';
import {HttpClientUtil} from './http-client.util';
import {WoWHeadUtil} from './wowhead.util';
import {GameBuild} from '../../../client/src/client/utils/game-build.util';
import {languages} from '../static-data/language.data';
import {ItemLocale} from '../models/item/item-locale';

 */
import {Reagent, Recipe} from '../model';
import {GameBuild} from '../../../../client/src/client/utils/game-build.util';
import { HttpClientUtil } from '../../utils/http-client.util';
import {WoWHeadUtil} from '../../utils/wowhead.util';
import {ItemLocale} from '@shared/models/item/item-locale';
import {languages} from '../../static-data/language.data';
import {ProfessionRepository} from '../../profession/repository';

export class ClassicRecipeUtil {

  private static slugifyString(realm: string): string {
    return realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase();
  }

  public static convert(wowDB): Recipe {
    const basePoints = wowDB.Effects[0].BasePoints;
    return {
      id: wowDB.ID * -1,
      spellId: wowDB.ID,
      craftedItemId: wowDB.CreatedItemID,
      name: wowDB.Name,
      rank: wowDB.Rank,
      minCount: basePoints > 0 ? basePoints : 1,
      maxCount: basePoints > 0 ? basePoints : 1,
      reagents: this.convertReagents(wowDB.Reagents)
    } as Recipe;
  }

  public static convertReagents(reagents: any[]): Reagent[] {
    const r = [];
    reagents.forEach(reagent => {
      r.push({
        id: reagent.Item,
        quantity: reagent.ItemQty
      });
    });
    return r;
  }

  static getRecipeListForPatch(patchNumber: number, gameVersion?: string, professions = GameBuild.professionsClassic): Promise<Recipe[]> {
    // gameVersion ? GameBuild.professionsClassic : GameBuild.professions;
    return new Promise<any>(async (resolve, reject) => {
      const professionRepository = new ProfessionRepository();
      const professionToIdMap: {[key: string]: number} = {};
      await professionRepository.getAllAfter(0, 'en_GB')
        .then(profs => {
          profs.forEach(profession => {
            professionToIdMap[profession.name] = profession.id;
          });
        })
        .catch(console.error);
      Promise.all(professions.map(profession =>
        this.getRecipeListForPatchAndProfession(patchNumber, profession, gameVersion, professionToIdMap)))
        .then((lists) => {
          let recipes = [];
          lists.forEach(r => {
            recipes = [...recipes, ...r];
          });
          resolve(recipes);
        })
        .catch(reject);
    });
  }

  static getRecipeListForPatchAndProfession(
    patchNumber: number,
    profession: string,
    gameVersion?: string,
    professionToIdMap?: { [key: string]: number }
  ): Promise<Recipe[]> {
    return new Promise<Recipe[]>((resolve, reject) => {
      const urlName = this.getUrlName(this.slugifyString(profession), gameVersion);
      const url = profession === 'None' ? 'https://tbc.wowhead.com/spells?filter=20:25;1:3;0:0#50' : this.getUrl(urlName);
      new HttpClientUtil().get(url, false)
        .then(async ({body}) => {
          const list = this.getList('', body);
          console.log(profession, list.length);
          const professionId = (profession === 'First aid' ? 1 : professionToIdMap[profession]) || null;
          resolve(this.mapResultToRecipe(list, professionId, gameVersion));
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
    switch (profession.toLowerCase()) {
      case 'cooking':
      case 'first-aid':
        return `secondary-skills/${profession}`;
      default:
        return `professions/${profession}`;
    }
    return profession === 'Cooking' && !gameVersion ? `cooking-recipe` : profession;
  }

  private static getUrl(urlName: string) {
    return `https://tbc.wowhead.com/spells/${urlName.toLocaleLowerCase()}?filter=20;1;0`;
  }

  private static async mapResultToRecipe(list, professionId: number, gameVersion?: string) {
    const recipes: Recipe[] = [];
    for (const recipe of list) {
      const {id, creates, name, reagents} = recipe;
      await this.setRankAndNameForRecipe(id, recipe);

      const minCount = creates ? creates[1] : 1,
        maxCount = creates ? creates[1] : 1;
      recipes.push({
        id: +id * -1,
        spellId: id,
        craftedItemId: creates ? +creates[0] : -1,
        name: recipe.name,
        minCount: minCount ? minCount : 1,
        maxCount: maxCount ? maxCount : 1,
        rank: recipe.rank || 0,
        professionId,
        reagents: (reagents || []).map(reagent => ({
          id: +reagent[0],
          quantity: +reagent[1]
        }))
      } as Recipe);
      console.log(recipes[recipes.length - 1]);
    }
    return recipes;
  }

  private static async setRankAndNameForRecipe(id: number, recipe): Promise<any> {
    recipe.name = new ItemLocale();
    for (const language of languages) {
      await this.getRecipeTooltip(id, language, recipe);
    }
    return recipe;
  }

  private static async getRecipeTooltip(id, language, recipe) {
    await new Promise<number>((resolve, reject) => {
      new HttpClientUtil().get(
        `https://tbc.wowhead.com/tooltip/spell/${id}?locale=${language.key}`)
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