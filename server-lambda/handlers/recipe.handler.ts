import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {Response} from '../utils/response.util';
import {Recipe} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';
import {RecipeUtil} from '../utils/recipe.util';
import {Endpoints} from '../utils/endpoints.util';
import {LocaleUtil} from '../utils/locale.util';

const request = require('require');

export class RecipeHandler {
  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const params = JSON.parse(event.body);
    new DatabaseUtil()
      .query(RecipeQuery.getAllRecipesAfterTimestamp(params.locale, params.timestamp))
      .then((recipes: any[]) => {
        console.log(RecipeQuery.getAllRecipesAfterTimestamp(params.locale, params.timestamp));
        Response.get(
          this.convertList(recipes), callback);
      })
      .catch(error => Response.error(callback, error));

  }

  update(event: APIGatewayEvent, callback: Callback) {

  }

  getById(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    new DatabaseUtil()
      .query(RecipeQuery.getById(id))
      .then(async (recipes: any[]) => {
        const recipe = this.convertList(recipes)[0];
        if (recipe) {
          Response.get(recipe, callback);
        } else {
          await this.getRecipeFromWowDB(id)
            .then(newRecipe => {
              this.getProfessionForRecipe(newRecipe)
                .then(profession => {
                  recipe.profession = profession;

                  Response.get(newRecipe, callback)
                    .finally(() => {
                      LocaleUtil.setLocales(
                        recipe.spellID,
                        'id',
                        'recipe_name_locale',
                        'spell'
                      );
                    });
                })
                .catch(error =>
                  Response.error(callback, error));
            });
        }
      })
      .catch(error => Response.error(callback, error));
  }

  convertList(list: any[]): Recipe[] {
    const recipes = [];
    list.forEach(i => {
      const recipe = JSON.parse(i.json);
      if (i.name) {
        recipe.name = i.name;
      }
      recipes.push(recipe);
    });
    return recipes;
  }

  private getRecipeFromWowDB(id: number): Promise<Recipe> {
    return new Promise<Recipe>((resolve, reject) => {
      request.get(`http://wowdb.com/api/spell/${id}`, async (error, result, body) => {
        const recipe = RecipeUtil.convert(JSON.parse(body.slice(1, body.length - 1)));
        const missingItemId = recipe.itemID === 0;
        if (missingItemId) {
          //
        }

        resolve(recipe);
      });
    });
  }

  private getProfessionForRecipe(recipe: Recipe): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      request.get(new Endpoints()
        .getPath(`recipe/${recipe.spellID}?locale=en_GB`), (err, r, body) => {
        try {
          const profession = JSON.parse(body).profession;
          resolve(profession);
        } catch (e) {
          reject({
            message: `Could not find a profession for ${recipe.spellID} - ${recipe.name}`,
            trace: e
          });
        }
      });
    });
  }
}
