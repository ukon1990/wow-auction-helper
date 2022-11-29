import {GameBuild} from '../../../shared/utils';
import {APIReagent, APIRecipe} from '../../../shared/models';
import {HttpClientUtil} from '../../../utils/http-client.util';
import {WoWHeadUtil} from '../../../utils/wowhead.util';
import {ProfessionRepository} from '../../profession/repository';
import {SharedRecipeUtil} from "@functions/recipe/util/shared.util";

export class ClassicRecipeUtil {

  private static slugifyString(realm: string): string {
    return realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase();
  }

  public static convert(wowDB): APIRecipe {
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
    } as APIRecipe;
  }

  public static convertReagents(reagents: any[]): APIReagent[] {
    const r = [];
    reagents.forEach(reagent => {
      r.push({
        id: reagent.Item,
        quantity: reagent.ItemQty
      });
    });
    return r;
  }

  static getRecipeListForPatch(
    patchNumber: number, gameVersion?: string, professions = GameBuild.professionsClassic
  ): Promise<APIRecipe[]> {
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
  ): Promise<APIRecipe[]> {
    return new Promise<APIRecipe[]>((resolve) => {
      const urlName = this.getUrlName(this.slugifyString(profession), gameVersion);
      const url = profession === 'None' ? 'https://www.wowhead.com/wotlk/spells?filter=20:25;1:3;0:0' : this.getUrl(urlName);
      new HttpClientUtil().get(url, false)
        .then(async ({body}) => {
          const list = this.getList('', body);
          console.log(profession, list.length);
          const professionId = (profession === 'First aid' ? 1 : professionToIdMap[profession]) || null;
          resolve(SharedRecipeUtil.mapResultToRecipe(list, professionId, true));
        })
        .catch((error) => {
          console.log(error);
          resolve([]);
        });
    });
  }

  static getList(gameVersion: string, body) {
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
    return `https://www.wowhead.com/wotlk/spells/${urlName.toLocaleLowerCase()}?filter=20;1;0`;
  }
}