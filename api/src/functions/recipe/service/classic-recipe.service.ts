import {RecipeAPIResponse} from '../model';
import {DatabaseUtil} from '../../../utils/database.util';
import {ClassicRecipeRepository} from '../repository/classic-recipe.repository';
import {APIRecipe} from '../../../shared/models';
import {ClassicRecipeUtil} from '@functions/recipe/util/classic-recipe.util';
import {S3Handler} from '@functions/handlers/s3.handler';
import {LocaleUtil} from '../../../utils/locale.util';
import {UpdatesService} from "@functions/updates/service";

export class ClassicRecipeService {
  private repository = new ClassicRecipeRepository();

  getById(id: any, locale: any) {
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

  getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<RecipeAPIResponse> {
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


  getAndInsertAll(): Promise<APIRecipe[]> {
    const db = new DatabaseUtil(false);
    return new Promise<APIRecipe[]>(async (resolve, reject) => {
      await db.enqueueHandshake().catch(console.error);

      ClassicRecipeUtil.getRecipeListForPatch(0, undefined, [])
        .then(async (recipes: APIRecipe[]) => {
          console.log('Starting to insert recipes');
          for (const recipe of recipes) {
            await this.repository.insertData(recipe, db)
              .catch(console.error);
          }

          if (!recipes.length) {
            await this.updateS3()
              .then(() => console.log('Done uploading items'))
              .catch(console.error);
            await UpdatesService.getAndSetTimestamps()
              .then(() => console.log('Done updating the timestamps'))
              .catch(console.error);
          }
          resolve(recipes);
        })
        .catch(reject)
        .finally(() => db.end());
    });
  }

  updateS3(db: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of LocaleUtil.getLocales()) {
        await new ClassicRecipeService().getAllAfter(0, LocaleUtil.getDbLocale(locale), db)
          .then(async recipes => {
            await new S3Handler().save(
              recipes,
              `classic/recipe/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded classic recipes');
              })
              .catch(reject);
          })
          .catch(reject);
      }

      db.end();
      resolve(true);
    });
  }
}