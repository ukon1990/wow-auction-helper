import {HttpClientUtil} from '../../../utils/http-client.util';
import {languages} from '../../../static-data/language.data';
import {APIRecipe, ItemLocale} from '../../../../../shared/src/models';
import {getWowHeadTooltipUrl} from '../../../../../shared/src/utils';

export class SharedRecipeUtil {
  static async getRecipeTooltip(id, language, recipe, isClassic: boolean = false): Promise<void> {
    await new Promise<void>((resolve) => {
      new HttpClientUtil().get(getWowHeadTooltipUrl(isClassic, id, 'spell', language.key))
        .then(({body}) => {
          if (language.key === 'en') {
            const regexResult = (/Rank [\d]{0,1}/g).exec(body.tooltip);
            if (regexResult && regexResult[0]) {
              recipe.rank = +regexResult[0].replace(/Rank /g, '');
            }
          }

          for (const loc of language.locales) {
            recipe.name[loc] = body.name;
          }

          resolve();
        })
        .catch(() => resolve());
    });
  }


  static async mapResultToRecipe(list, professionId: number, isClassic: boolean): Promise<APIRecipe[]> {
    const recipes: APIRecipe[] = [];
    for (const recipe of list) {
      if (recipe.name.indexOf('(DNT)') === -1) {

        const {id, creates, reagents} = recipe;
        await this.setRankAndNameForRecipe(+id * -1, recipe, isClassic);

        const minCount = creates ? creates[1] : 1,
          maxCount = creates ? creates[1] : 1;
        recipes.push({
          id: +id * -1,
          spellId: id,
          craftedItemId: creates ? +creates[0] : -1,
          name: recipe.name as ItemLocale,
          minCount: minCount ? minCount : 1,
          maxCount: maxCount ? maxCount : 1,
          rank: recipe.rank || 0,
          professionId,
          reagents: (reagents || []).map(reagent => ({
            id: +reagent[0],
            quantity: +reagent[1]
          }))
        } as APIRecipe);

        console.log(`mapResultToRecipe progress: ${recipes.length} / ${list.length} = ${
          Math.round((recipes.length / list.length) * 100)}%`);
      }
    }
    return recipes;
  }

  private static async setRankAndNameForRecipe(id: number, recipe, isClassic: boolean): Promise<any> {
    recipe.name = new ItemLocale();
    recipe.name.id = id;
    for (const language of languages) {
      await this.getRecipeTooltip(recipe.id, language, recipe, isClassic);
    }
    return recipe;
  }
}