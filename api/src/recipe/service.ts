import {Recipe} from './model';
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

  static getAllAfter(timestamp: number, locale: string): Promise<{timestamp: number; recipes: Recipe[]}> {
    return new Promise((resolve, reject) => {
      const db = new DatabaseUtil(false);
      this.repository.getAllAfter(timestamp, locale, db)
        .then((recipes: Recipe[]) => resolve({
          timestamp: recipes[0] ? recipes[0].timestamp : timestamp,
          recipes
        }))
        .catch(reject);
    });
  }
}
