import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {Response} from '../utils/response.util';
import {Recipe, RecipeSpell} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';
import {RecipeUtil} from '../utils/recipe.util';
import {Endpoints} from '../utils/endpoints.util';
import {LocaleUtil} from '../utils/locale.util';
import {Item} from '../../../client/src/client/models/item/item';
import {AuthHandler} from './auth.handler';
import {ItemQuery} from '../queries/item.query';
import {ItemLocale} from '../models/item/item-locale';
import {QueryUtil} from '../utils/query.util';

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

  update(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    new DatabaseUtil()
      .query(RecipeQuery.getById(id))
      .then(async (recipes: any[]) => {
        const oldVersion = this.convertList(recipes)[0];
        await this.getRecipeFromWowDB(id, event)
          .then(async (currentRecipe: Recipe) => {
            // Enchants does not have itemID set as creates in WoWDB, so don't overwrite 0 itemID's
            if (oldVersion.itemID && !currentRecipe.itemID) {
              currentRecipe.itemID = oldVersion.itemID;
            }

            await this.setItemIdIfMissing(currentRecipe);

            currentRecipe.name = oldVersion.name;
            currentRecipe.profession = oldVersion.profession;

            new DatabaseUtil()
              .query(RecipeQuery.update(currentRecipe))
              .then(() => Response.send(currentRecipe, callback))
              .catch(error => Response.error(callback, error, event));
          })
          .catch(error => Response.error(callback, error, event));
      })
      .catch(error => Response.error(callback, error, event));
  }

  getById(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    new DatabaseUtil()
      .query(RecipeQuery.getById(id))
      .then(async (recipes: any[]) => {
        const recipe = this.convertList(recipes)[0];
        if (recipe) {
          Response.send(recipe, callback);
        } else {
          this.addRecipe(id, JSON.parse(event.body).locale, event, callback);
        }
      })
      .catch(error => Response.error(callback, error, event));
  }

  private async addRecipe(
    id,
    locale: string,
    event: APIGatewayEvent,
    callback: Callback
  ) {
    await this.getRecipeFromWowDB(id, event).then(recipe => {
      this.getProfessionForRecipe(recipe)
        .then(async spell => {
          recipe.profession = spell.profession;
          await this.setItemIdIfMissing(recipe)
            .catch(console.error);

          await RecipeUtil.getLocalesForRecipe(id)
            .then(async recipeName => {
              if (!recipeName || Object.keys(recipeName).length !== 14) {
                Response.error(callback, 'Locale not found:' + Object.keys(recipeName).length, event);
                return;
              }
              const conn = new DatabaseUtil(false);
              await conn.query(RecipeQuery.insert(id, recipe));
              await conn.query(new QueryUtil('recipe_name_locale', false).insert(recipeName))
                .then(console.log)
                .catch((error) => {
                  console.error(error);
                });
              conn.end();
              recipe.name = recipeName[locale];
              Response.send(recipe, callback);
            })
            .catch(error => Response.error(callback, error, event));
        })
        .catch(error => Response.error(callback, error, event));
    });
  }

  private async setItemIdIfMissing(recipe) {
    if (!recipe.itemID) {
      // We need to check if there is an item referencing this spell
      await new DatabaseUtil().query(ItemQuery.getItemWithNameLike(recipe.name))
        .then(ids => {
          if (ids.length > 0) {
            recipe.itemID = ids[0].id;
          }
        })
        .catch(console.error);
    }
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
          const recipe = RecipeUtil.convert(
            JSON.parse(body.slice(1, body.length - 1))
          );
          const missingItemId = recipe.itemID === 0;

          if (missingItemId) {
            await new DatabaseUtil()
              .query(RecipeQuery.getItemWithSimilarName(recipe))
              .then((item: Item) => (recipe.itemID = item.id))
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

  async getProfessionForRecipe(
    recipe: Recipe,
    locale: string = 'en_US',
    region: string = 'us'
  ): Promise<RecipeSpell> {
    await AuthHandler.getToken();
    const url = new Endpoints().getPath(
      `recipe/${recipe.spellID}?locale=${locale ? locale : 'en_US'}`,
      region
    );
    return new Promise<RecipeSpell>((resolve, reject) => {
      request.get(url, (err, r, body) => {
        try {
          const spell = JSON.parse(body) as RecipeSpell;
          resolve(spell);
        } catch (e) {
          console.log('Error on', body);
          reject({
            message: `Could not find a profession for ${recipe.spellID} - ${
              recipe.name
              }`,
            trace: e
          });
        }
      });
    });
  }
}
