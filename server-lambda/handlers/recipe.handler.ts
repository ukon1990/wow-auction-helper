import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {Response} from '../utils/response.util';
import {Recipe} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';

export class RecipeHandler {
  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const params = JSON.parse(event.body);
    new DatabaseUtil()
      .query(RecipeQuery.getAllRecipesWithNoItemId(params.locale, params.timestamp))
      .then((recipes: any[]) => {
        const recipe = this.convertList(recipes)[0];
        if (recipe) {
          Response.get(recipe, callback);
        } else {
          Response.error(callback);
        }
      })
      .catch(error => Response.error(callback, error));

  }

  update(event: APIGatewayEvent, callback: Callback) {

  }

  getById(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    new DatabaseUtil()
      .query(RecipeQuery.getById(id))
      .then((recipes: any[]) => {
        const recipe = this.convertList(recipes)[0];
        if (recipe) {
          Response.get(recipe, callback);
        } else {
          Response.error(callback);
        }
        console.log('id', id);
      })
      .catch(error => Response.error(callback, error));
  }

  convertList(list: any[]): Recipe[] {
    const recipes = [];
    list.forEach(i =>
      recipes.push(JSON.parse(i.json)));
    return recipes;
  }
}
