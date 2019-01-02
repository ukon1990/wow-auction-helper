import {Response} from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import {LocaleUtil} from './locale.util';
import {DATABASE_CREDENTIALS} from './secrets';
import {Recipe} from '../models/crafting/recipe';
import {RecipeQuery} from '../queries/recipe.query';
import {Endpoints} from '../endpoints';

const PromiseThrottle: any = require('promise-throttle');

export class RecipeUtil {
  public static getRecipe(id: number, res: Response, req: any) {
    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    db.query(`SELECT json
              from recipes
    WHERE id = ${id}`, (dbError, rows) => {
      db.end();
      try {
        if (!dbError && rows.length > 0) {
          try {
          } catch (e) {
            console.error('Could not call end()', e);
          }

          rows.forEach(r => {
            try {
              res.json(JSON.parse(r.json));
            } catch (err) {
              console.error(err, r.json);
            }
          });
        } else {
          request.get(`http://wowdb.com/api/spell/${id}`,
            (reqError, response, body) => {
              try {
                const recipe = RecipeUtil.convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
                // res.send(recipe);
                RecipeUtil.getProfession(recipe, (r) => {
                  const query = RecipeQuery.insert(id, recipe);
                  console.log(`${new Date().toString()} - Adding new recipe (${r.name}) - SQL: ${query}`);
                  const dbAdd = mysql.createConnection(DATABASE_CREDENTIALS);
                  dbAdd.query(query, (err) => {
                    dbAdd.end();
                    if (!err) {
                    } else {
                      throw err;
                    }
                  });

                  this.addLocaleForRecipe(id, recipe);
                  res.send(r);
                });
              } catch (error) {
                console.error(`Could not get recipe with id ${id}`, error);
                res.status(404).send(new Recipe());
              }
            });
        }
      } catch (e) {
        console.error(`${new Date().toString()} - Getting a recipe failed for the spellID ${req.params.spellID}`, e);
      }
    });
  }

  private static addLocaleForRecipe(id: number, recipe) {
    LocaleUtil.setLocales(
      id,
      'id',
      'recipe_name_locale',
      'spell')
      .then(p =>
        console.log(`Added locale for recipe ${recipe.name}`))
      .catch(e =>
        console.error(`Could not get locale for recipe ${recipe.name}`, e));
  }

  public static postRecipes(
    response: Response,
    req: any
  ): void {

    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    // select json, de_DE from recipes as r, recipe_name_locale as l where r.id = l.id;
    db.query(RecipeQuery.getAllRecipesWithNoItemId(req), (err, rows, fields) => {
      db.end();
      if (!err) {
        const recipes: any[] = [],
          timestamp = rows.length > 0 ? rows[0].timestamp : undefined;
        rows.forEach((row: any) => {
          try {
            const recipe = JSON.parse(row.json);
            if (row.name) {
              recipe.name = row.name;
            }
            recipes.push(recipe);
          } catch (err) {
            console.error(`${new Date().toString()} - Could not parse json (${row.id})`, row.json, err);
          }
        });
        response.send({
          timestamp: timestamp,
          recipes: recipes
        });
      } else {
        console.log(`${new Date().toString()} - The following error occured while querying DB:`, err);
      }
    });
  }

  /**
   * For updating a recipe
   * @param response
   * @param req
   */
  public static async patchRecipe(
    id: number,
    res: Response,
    req: any
  ) {
    request.get(`http://wowdb.com/api/spell/${id}`, async (error, result, body) => {
      try {
        const recipe = RecipeUtil.convertWoWDBToRecipe(JSON.parse(body.slice(1, body.length - 1)));
        const missingItemId = recipe.itemID === 0;

        if (missingItemId) {
          await new Promise((resolve, reject) => {
            request.get(`http://localhost:3000/api/recipe/${recipe.spellID}`, async (err, r, b) => {
              const recip = b ? JSON.parse(b) : {};
              if (recip) {
                recipe.itemID = recip.itemID;
                resolve();
              }
            });
          }).then();
          if (recipe.itemID === 0) {
            const db = mysql.createConnection(DATABASE_CREDENTIALS);
            const sql = `select id from items where name like "%${recipe.name}%" limit 1;`;
            await db.query(sql, (err, rows, fields) => {
              db.end();
              if (err) {
                console.error('Error', err);
              } else if (rows.length > 0) {
                recipe.itemID = rows[0].id;
              }
            });
          }
        }
        await RecipeUtil.getProfession(recipe, function (r) {
          const query = RecipeQuery.update(recipe, id);

          console.log(`${new Date().toString()} - Updating recipe (${r.name}) - SQL: ${query}`);
          const dbAdd = mysql.createConnection(DATABASE_CREDENTIALS);
          dbAdd.query(query, (err) => {
            dbAdd.end();
            if (!err) {
            } else {
              throw err;
            }
          });
          res.send(r);
        });
      } catch (error) {
        console.error(`Could not get recipe with id ${id}`, error);
        res.status(404).send(new Recipe());
      }
    });
  }

  public static async getItemsToAdd(
    rows: number[],
    response: Response,
    req: any) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 20,
      promiseImplementation: Promise
    });
    const items: Recipe[] = [], itemIDs: any[] = [], failedIds = [];
    let updateCount = 0;

    rows.forEach((id: number) => {
      itemIDs.push(
        promiseThrottle.add(() => {
          return new Promise(async (resolve, reject) => {
            updateCount++;
            console.log(`Getting Item: ${id} (${updateCount} / ${rows.length}) ${req.headers.host}`);
            await request.get(`http://${req.headers.host}/api/recipe/${id}`, (res, error, body) => {
              if (error) {
                // console.error('handleItemsPatchRequest', error);
                console.error(`ERROR for item ID ${id} - > ${req.headers.host}/api/recipe/${id}`, error);
                failedIds.push(id);
                reject(error);
              } else {
                console.log(`Added item ID ${id} - > ${req.headers.host}/api/recipe/${id}`);
                items.push(body);
                resolve(body);
              }
            });
          });
        }));
    });
    await Promise.all(itemIDs)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));

    response.send({success: items, failed: failedIds});
  }

  public static convertWoWDBToRecipe(wowDBRecipe) {
    const basePoints = wowDBRecipe.Effects[0].BasePoints,
      recipe = {
        spellID: wowDBRecipe.ID,
        itemID: wowDBRecipe.CreatedItemID,
        name: wowDBRecipe.Name,
        profession: 'none',
        rank: wowDBRecipe.Rank,
        minCount: basePoints > 0 ? basePoints : 1,
        maxCount: basePoints > 0 ? basePoints : 1,
        reagents: RecipeUtil.convertReagents(wowDBRecipe.Reagents)
      };
    return recipe;
  }

  public static convertReagents(reagents) {
    const r = [];
    reagents.forEach(reagent => {
      r.push({itemID: reagent.Item, name: '', count: reagent.ItemQty, dropped: false});
    });
    return r;
  }

  public static getProfession(recipe, callback) {
    request.get(new Endpoints()
      .getPath(`recipe/${recipe.spellID}?locale=en_GB`), (err, r, body) => {
      try {
        recipe.profession = JSON.parse(body).profession;
      } catch (e) {
        console.error(`Could not find a profession for ${recipe.spellId} - ${recipe.name}`, body, e);
      }
      RecipeUtil.processReagents(recipe, 0, callback);
    });
  }

  public static processReagents(recipe, nextIndex, callback) {
    if (nextIndex >= recipe.reagents.length) {
      callback(recipe);
    } else {
      request.get(`https://wowdb.com/api/item/${recipe.reagents[nextIndex].itemID}`, (err, r, body) => {
        try {
          const item = JSON.parse(body.slice(1, body.length - 1));

          recipe.reagents[nextIndex].name = item.Name;
          recipe.reagents[nextIndex].dropped = item && item.DroppedBy && item.DroppedBy.length > 0;

          RecipeUtil.processReagents(recipe, nextIndex + 1, callback);
        } catch (e) {
          console.error(`Could not get item ${recipe.reagents[nextIndex].itemID}`, body, e);
        }
      });
    }
  }

  public static setMissingLocales(req, res) {
    // Limit to 9 per second
    return new Promise((reso, rej) => {
      const connection = mysql.createConnection(DATABASE_CREDENTIALS);
      connection.query(RecipeQuery.getSelectIdFromRecipesWhereIdNotInSelectIdFromRecipeNameLocale(), async (err, rows, fields) => {
        if (!err) {
          const promiseThrottle = new PromiseThrottle({
            requestsPerSecond: 1,
            promiseImplementation: Promise
          });

          const list = [];
          const spellIDs = [];
          rows.forEach(row => {
            spellIDs.push(
              promiseThrottle.add(() => {
                return new Promise((resolve, reject) => {
                  LocaleUtil.setLocales(
                    row.id,
                    'id',
                    'recipe_name_locale',
                    'spell')
                    .then(r => {
                      list.push(r);
                      resolve(r);
                    })
                    .catch(e => {
                      console.error(e);
                      reject({});
                    });
                });
              }));
          });
          await Promise.all(spellIDs)
            .then(r => {
            })
            .catch(e => console.error(e));
          reso(list);
        } else {
          rej({});
        }
      });
    });
  }
}
