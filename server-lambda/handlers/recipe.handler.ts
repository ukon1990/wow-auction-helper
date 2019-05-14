import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {Response} from '../utils/response.util';
import {Recipe, RecipeSpell} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';
import {RecipeUtil} from '../utils/recipe.util';
import {Endpoints} from '../utils/endpoints.util';
import {LocaleUtil} from '../utils/locale.util';
import {Item} from '../models/item/item';
import {ItemHandler} from './item.handler';

const request = require('request');

export class RecipeHandler {
  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const params = JSON.parse(event.body);
    new DatabaseUtil()
      .query(RecipeQuery.getAllRecipesAfterTimestamp(params.locale, params.timestamp))
      .then((recipes: any[]) => {
        console.log(RecipeQuery.getAllRecipesAfterTimestamp(params.locale, params.timestamp));
        Response.send({
          timestamp: recipes[0] ? recipes[0]['timestamp'] : new Date().toJSON(),
          recipes: this.convertList(recipes)
        }, callback);
      })
      .catch(error =>
        Response.error(callback, error, event));

  }

  update(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    new DatabaseUtil()
      .query(RecipeQuery.getById(id))
      .then(async (recipes: any[]) => {
        const oldVersion = this.convertList(recipes)[0];
        await this.getRecipeFromWowDB(id, event)
          .then((currentRecipe: Recipe) => {
            // Enchants does not have itemID set as creates in WoWDB, so don't overwrite 0 itemID's
            if (oldVersion.itemID && !currentRecipe.itemID) {
              currentRecipe.itemID = oldVersion.itemID;
            }
            currentRecipe.name = oldVersion.name;

            Response.send(currentRecipe, callback);

            new DatabaseUtil()
              .query(RecipeQuery.update(currentRecipe))
              .then(() =>
                Response.send(currentRecipe, callback))
              .catch(error =>
                Response.error(callback, error, event));

          })
          .catch(error =>
            Response.error(callback, error, event));
      })
      .catch(error =>
        Response.error(callback, error, event));
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
          this.addRecipe(id, recipe, JSON.parse(event.body).locale, event, callback);
        }
      })
      .catch(error =>
        Response.error(callback, error, event));
  }

  private async addRecipe(id, recipe, locale: string, event: APIGatewayEvent, callback: Callback) {
    await this.getRecipeFromWowDB(id, event)
      .then(newRecipe => {
        this.getProfessionForRecipe(newRecipe)
          .then(async spell => {
            recipe.profession = spell.profession;

            await new DatabaseUtil()
              .query(
                RecipeQuery.insert(id, recipe));

            await LocaleUtil.setLocales(
              recipe.spellID,
              'id',
              'recipe_name_locale',
              'spell'
            ).then(locales => {
              if (locales[locale]) {
                recipe.name = locales[locale];
              }
            })
              .catch(error =>
                Response.error(callback, error, event));
            Response.send(newRecipe, callback);
          })
          .catch(error =>
            Response.error(callback, error, event));
      });
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

  private getRecipeFromWowDB(id: number, event: APIGatewayEvent): Promise<Recipe> {
    return new Promise<Recipe>((resolve, reject) => {
      request.get(`http://wowdb.com/api/spell/${id}`, async (error, result, body) => {
        const recipe = RecipeUtil.convert(JSON.parse(body.slice(1, body.length - 1)));
        const missingItemId = recipe.itemID === 0;

        if (missingItemId) {
          await new DatabaseUtil()
            .query(RecipeQuery.getItemWithSimilarName(recipe))
            .then((item: Item) =>
              recipe.itemID = item.id)
            .catch(e =>
              console.error(e));
        }

        new DatabaseUtil()
          .query(RecipeQuery.getMissingItems(recipe))
          .then((rows: any[]) => {
            if (rows.length > 0) {
              console.log('Adding missing items');
              rows.forEach(row => {
                // We don't really need to do anything upon success/failure here
                request.post(
                  `https://${
                    event.headers.Host}${
                    event.requestContext.stage}/item/${
                    id}`, event.body, () => {
                  });
              });
            }
          });

        resolve(recipe);
      });
    });
  }

  getProfessionForRecipe(recipe: Recipe, locale: string = 'en_GB', region: string = 'eu'): Promise<RecipeSpell> {
    return new Promise<RecipeSpell>((resolve, reject) => {
      request.get(new Endpoints()
        .getPath(`recipe/${recipe.spellID}?locale=${locale ? locale : 'en_GB'}`, region),
        (err, r, body) => {
        try {
          const spell = JSON.parse(body) as RecipeSpell;
          resolve(spell);
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
