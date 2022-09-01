import {RecipeAPIResponse} from '../model';
import {DatabaseUtil} from '../../../utils/database.util';
import {ClassicRecipeRepository} from '../repository/classic-recipe.repository';
import {APIRecipe} from '../../../shared/models';

export class ClassicRecipeService {
  private static repository = new ClassicRecipeRepository();

  static getById(id: any, locale: any) {
    return new Promise<APIRecipe>(async (resolve, reject) => {
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
        .then((recipes: APIRecipe[]) => resolve({
          timestamp: recipes[0] ? recipes[0].timestamp : timestamp,
          recipes: recipes.map(recipe => {
            delete recipe.timestamp;
            return recipe;
          })
        }))
        .catch(reject);
    });
  }

  /*
  static getAndInsert(id: number, db: DatabaseUtil): Promise<Recipev2> {
    return new Promise<Recipev2>((resolve, reject) => {
      ClassicRecipeUtil.getRecipeFromAPI(id)
        .then((recipe: Recipev2) => {
          this.repository.insertData(recipe, db)
            .then(() => resolve(recipe))
            .catch(reject);
        })
        .catch(reject);
    });
  }
  */
}