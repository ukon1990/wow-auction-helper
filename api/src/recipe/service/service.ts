import {Recipe, RecipeAPIResponse} from '../model';
import {DatabaseUtil} from '../../utils/database.util';
import {Recipev2} from '../recipev2.model';
import {RecipeRepository} from '../repository/repository';
import {RecipeV2Util} from '../util/recipev2.util';

export class RecipeService {
  private static repository = new RecipeRepository();

  static getById(id: any, locale: any, db?: DatabaseUtil) {
    return new Promise<Recipe>(async (resolve, reject) => {
      const closeConnection = db === undefined;
      if (!db) {
        db = new DatabaseUtil(false);
      }
      await this.repository.getById(id, locale, db)
        .then(res => {
          if (closeConnection) {
            db.end();
          }
          resolve(res);
        })
        .catch(err => {
          if (closeConnection) {
            db.end();
          }
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

  static getAndInsert(id: number, db: DatabaseUtil): Promise<Recipev2> {
    return new Promise<Recipev2>((resolve, reject) => {
      this.getById(id, 'en_GB', db)
        .then(existingRecipe => {
          resolve();
        })
        .catch(error => {
          if (error === 'missing') {
            console.log('Downloading recipe with id', id);
            RecipeV2Util.getRecipeFromAPI(id)
              .then((recipe: Recipev2) => {
                console.log('Found a new recipe', id, recipe.name.en_GB);
                this.repository.insertData(recipe, db)
                  .then(() => resolve(recipe))
                  .catch(reject);
              })
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }
}
