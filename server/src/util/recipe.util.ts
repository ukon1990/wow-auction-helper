import { Request, Response } from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import * as RequestPromise from 'request-promise';
import { getLocale } from '../util/locales';
import { safeifyString } from './string.util';
import { BLIZZARD_API_KEY, DATABASE_CREDENTIALS } from './secrets';
import { Recipe } from '../models/crafting/recipe';
const PromiseThrottle: any = require('promise-throttle');

export class RecipeUtil {
  public static getRecipe(id: number, response: Response, request: any) {}
  public static getRecipes(
    response: Response,
    request: any
  ): void {

    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    // select json, de_DE from recipes as r, recipe_name_locale as l where r.id = l.id;
    db.query(`
      SELECT l.id, json, ${ getLocale(request) } as name from  recipes as r
      LEFT OUTER JOIN recipe_name_locale as l
      ON r.id = l.id
      WHERE json NOT LIKE '%itemID":0%';`, (err, rows, fields) => {
      db.end();
      if (!err) {
        const recipes: any[] = [];
        rows.forEach((row: any) => {
          try {
            recipes.push(
              JSON.parse(row.json));
          } catch (err) {
            console.error(`${new Date().toString()} - Could not parse json (${row.id})`, row.json, err);
          }
        });
        response.send({ 'recipes': recipes });
      } else {
        console.log(`${new Date().toString()} - The following error occured while querying DB:`, err);
      }
    });
  }
}