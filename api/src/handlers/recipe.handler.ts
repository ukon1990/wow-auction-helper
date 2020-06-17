import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {Response} from '../utils/response.util';
import {Recipe} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';
import {OldRecipeUtil} from '../recipe/old-util';
import {Item} from '../../../client/src/client/models/item/item';

const request = require('request');

export class RecipeHandler {
  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const params = JSON.parse(event.body);
    new DatabaseUtil()
      .query(
        RecipeQuery.getAllRecipesAfterTimestamp(params.locale, params.timestamp)
      )
      .then((recipes: any[]) => {
        console.log(
          RecipeQuery.getAllRecipesAfterTimestamp(
            params.locale,
            params.timestamp
          )
        );
        Response.send(
          {
            timestamp: recipes[0]
              ? recipes[0]['timestamp']
              : new Date().toJSON(),
            recipes: this.convertList(recipes)
          },
          callback
        );
      })
      .catch(error => Response.error(callback, error, event));
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

  private getRecipeFromWowDB(
    id: number,
    event: APIGatewayEvent
  ): Promise<Recipe> {
    return new Promise<Recipe>((resolve, reject) => {
      request.get(
        `http://ptr.wowdb.com/api/spell/${id}`,
        async (error, result, body) => {
          const recipe = OldRecipeUtil.convert(
            JSON.parse(body.slice(1, body.length - 1))
          );
          const missingItemId = recipe.craftedItemId === 0;

          if (missingItemId) {
            await new DatabaseUtil()
              .query(RecipeQuery.getItemWithSimilarName(recipe))
              .then((item: Item) => (recipe.craftedItemId = item.id))
              .catch(e => console.error(e));
          }

          new DatabaseUtil()
            .query(RecipeQuery.getMissingItems(recipe))
            .then((rows: any[]) => {
              if (rows.length > 0) {
                console.log('Adding missing items');
                rows.forEach(row => {
                  // We don't really need to do anything upon success/failure here
                  request.post(
                    `https://${event.headers.Host}${
                      event.requestContext.stage
                    }/item/${id}`,
                    event.body,
                    () => {
                    }
                  );
                });
              }
            });

          resolve(recipe);
        }
      );
    });
  }
}
