import {Repository} from '../core/repository';
import {DatabaseUtil} from '../utils/database.util';
import {format} from 'sqlstring';
import {Reagent, Recipe} from './model';
import {rejects} from 'assert';

export class RecipeRepository extends Repository<Recipe> {

  constructor() {
    super('recipes_new', 'recipesName');
  }

  private geteBaseQuery(locale): string {
    return `SELECT recipes.id        as id,
                              recipes.icon      as icon,
                              name.${locale}        as name,
                              description.${locale} as decription,
                              rank,
                              craftedItemId,
                              hordeCraftedItemId,
                              allianceCraftedItemId,
                              minCount,
                              maxCount,
                              procRate,
                              professions.id    as professionId,
                              skillTier.id      as skillTierId
                       FROM recipes_new as recipes
                                LEFT JOIN recipesName as name ON name.id = recipes.id
                                LEFT JOIN recipesDescription as description ON description.id = recipes.id
                                LEFT JOIN professionSkillTiers as skillTier ON skillTier.id = recipes.professionSkillTierId
                                LEFT JOIN professions ON professions.id = skillTier.professionId`;
  }

  delete(id: number): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  /**
   SELECT r.id, json, ${getLocale(locale)} as name, timestamp from  recipes as r
   LEFT OUTER JOIN recipe_name_locale as l
   ON r.id = l.id
   WHERE UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000}
   ORDER BY timestamp desc;
   * @param timestamp
   * @param db
   */
  getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<Recipe[]> {
    return new Promise<Recipe[]>((resolve, reject) => {
      db.query(`${this.geteBaseQuery(locale)}
          WHERE UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000};`)
        .then((recipes: Recipe[]) => {
          const map = {};
          recipes.forEach(recipe => map[recipe.id] = recipe);

          db.query(`
            SELECT *
            FROM reagents
                LEFT JOIN ${this.table} as recipes ON recipes.id = reagents.recipeId
            WHERE UNIX_TIMESTAMP(timestamp) > ${Math.round(+new Date(timestamp) / 1000)};`)
            .then((reagents: any[]) => {
              reagents.forEach(r => {
                if (!map[r['recipeId']].reagents) {
                  map[r['recipeId']].reagents = [];
                }
                map[r['recipeId']].reagents.push({
                  id: r.itemId,
                  quantity: r.quantity,
                  isOptional: !!r.isOptional
                });
              });
              resolve(recipes);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getById(id: number, locale: string, db: DatabaseUtil): Promise<Recipe> {
    return new Promise<Recipe>((resolve, reject) => {
      db.query(`${this.geteBaseQuery(locale)}
        WHERE recipes.id = ${id};`)
        .then((recipes: Recipe[]) => {
          if (recipes.length) {
            db.query(`
                        SELECT itemId as id,
                               quantity,
                               isOptional
                        FROM reagents
                        WHERE recipeId = ${id}`)
              .then(reagents => {
                resolve({
                  ...recipes[0],
                  reagents: reagents.map((reagent: Reagent) => ({
                    ...reagent,
                    isOptional: !!reagent.isOptional
                  }))
                } as Recipe);
              })
              .catch(reject);
          } else {
            reject('missing');
          }
        })
        .catch(reject);
    });
  }

  insert(data: Recipe): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  update(data: Recipe): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

}
