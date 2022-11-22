import {RecipeAPIResponse} from '../model';
import {DatabaseUtil} from '../../../utils/database.util';
import {Recipev2} from '../recipev2.model';
import {RecipeRepository} from '../repository/repository';
import {RecipeV2Util} from '../util/recipev2.util';
import {APIRecipe} from '../../../shared/models';

export class RecipeService {
  private static repository = new RecipeRepository();

  static getById(id: any, locale: any, db?: DatabaseUtil) {
    return new Promise<APIRecipe>(async (resolve, reject) => {
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

  static getAndInsert(id: number, db: DatabaseUtil): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getById(id, 'en_GB', db)
        .then(async existingRecipe => {
          // Comment out temporarily for updates relating to patches or expansions?
          // So that there is less API spam?
          await RecipeV2Util.getRecipeFromAPI(id)
            .then((recipe: Recipev2) => {
              this.repository.insertData(recipe, db)
                .then(async () => {
                  const queries = [];
                  this.repository.getModifiedCraftingSlotQueries(existingRecipe[0], queries);
                  for (const query of queries) {
                    await db.query(query).catch(console.error);
                  }
                  console.log('Updating existing recipe', id, recipe.name.en_GB, queries.length);
                })
                .catch(reject);
            })
            .catch(reject);
          resolve();
        })
        .catch(error => {
          if (error === 'missing') {
            console.log('Downloading recipe with id', id);
            RecipeV2Util.getRecipeFromAPI(id)
              .then((recipe: Recipev2) => {
                console.log('Found a new recipe', id, recipe.name.en_GB);
                this.repository.insertData(recipe, db)
                  .then(() => resolve())
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