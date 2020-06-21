import {Recipe, RecipeAPIResponse} from './model';
import {DatabaseUtil} from '../utils/database.util';
import {RecipeRepository} from './repository';

export class RecipeService {
  private static repository = new RecipeRepository();

  static getById(id: any, locale: any) {
    return new Promise<Recipe>(async (resolve, reject) => {
      const db = new DatabaseUtil(false);
      await this.repository.getById(id, locale, db)
        .then(res => {
          db.end();
          resolve(res);
        })
        .catch(err => {
          db.end();
          reject(err);
        });
    });
  }

  static getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<RecipeAPIResponse> {
    return new Promise((resolve, reject) => {
      this.repository.getAllAfter(timestamp, locale, db)
        .then((recipes: Recipe[]) => resolve({
          timestamp: recipes[0] ? recipes[0].timestamp : timestamp,
          recipes: recipes.map(recipe => {
            delete recipe.timestamp;
            return recipe;
          })
        }))
        .catch(reject);
    });
  }
}
