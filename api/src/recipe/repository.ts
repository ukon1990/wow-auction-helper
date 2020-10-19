import {Repository} from '../core/repository';
import {DatabaseUtil} from '../utils/database.util';
import {Reagent, Recipe} from './model';
import {RDSQueryUtil} from '../utils/query.util';
import {format} from 'sqlstring';
import {Recipev2} from './recipev2.model';

export class RecipeRepository extends Repository<Recipe> {

  constructor() {
    super('recipes', 'recipesName');
  }

  private geteBaseQuery(locale: string): string {
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
                              skillTier.id      as skillTierId,
                              recipes.timestamp as timestamp
                       FROM recipes
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
      const unix = +new Date(timestamp);
      console.log('unix', unix);
      const date = isNaN(unix) ? 0 : Math.round( unix / 1000);
      db.query(`${this.geteBaseQuery(locale)}
          WHERE UNIX_TIMESTAMP(recipes.timestamp) > ${date}
          ORDER BY recipes.timestamp DESC;`)
        .then((recipes: Recipe[]) => {
          const map = {};
          recipes.forEach(recipe => {
            map[recipe.id] = recipe;
          });

          db.query(`
            SELECT *
            FROM reagents
                LEFT JOIN recipes ON recipes.id = reagents.recipeId
            WHERE UNIX_TIMESTAMP(timestamp) > ${date};`)
            .then((reagents: any[]) => {
              reagents.forEach(r => {
                if (!map[r['recipeId']].reagents) {
                  map[r['recipeId']].reagents = [];
                }
                map[r['recipeId']].reagents.push({
                  id: r.itemId,
                  quantity: r.quantity
                });
              });
              db.query(`
                SELECT id, sortOrder, recipeId
                FROM recipesModifiedCraftingSlot;
              `)
                .then((modifiers: {id, sortOrder, recipeId}[]) => {
                  modifiers.forEach(modifier => {
                    if (!map[modifier.recipeId].modifiedSlots) {
                      map[modifier.recipeId].modifiedSlots = [];
                    }
                    map[modifier.recipeId].modifiedSlots.push({
                      id: modifier.id,
                      sortOrder: modifier.sortOrder,
                    });
                  });

                  resolve(recipes);
                })
                .catch(reject);
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

  insertData(recipe: Recipev2, db: DatabaseUtil): Promise<void> {
    // this.getIcon(recipe.id)
    return new Promise(async (resolve, reject) => {
          const queries = [
            new RDSQueryUtil('recipesName', false).insert({
              id: recipe.id,
              ...recipe.name
            })
          ];

          if (recipe.reagents) {
            queries.push(...recipe.reagents.map(r => format(`
                INSERT INTO reagents
                VALUES (?, ?, ?, ?);
            `, [
              recipe.id,
              r.reagent.id,
              r.quantity,
              0
            ])));
          }

          if (recipe.description && recipe.description.en_GB) {
            queries.push(new RDSQueryUtil('recipesDescription', false).insert({
              id: recipe.id,
              ...recipe.description
            }));
          }

          if (recipe.modified_crafting_slots) {
            recipe.modified_crafting_slots.forEach(slot => queries.push(
              new RDSQueryUtil('recipesModifiedCraftingSlot', false).insert({
                id: slot.slot_type.id,
                recipeId: recipe.id,
                sortOrder: slot.display_order,
              })
            ));
          }
          await db.query(`INSERT INTO recipes(
                        id,
                        icon,
                        rank,
                        craftedItemId,
                        hordeCraftedItemId,
                        allianceCraftedItemId,
                        minCount,
                        maxCount,
                        procRate,
                        timestamp,
                        professionSkillTierId
            )
            VALUES (
                    ${recipe.id},
                    "${recipe.media.icon}",
                    ${recipe.rank || 0},
                    ${recipe.crafted_item ? recipe.crafted_item.id : null},
                    ${recipe.horde_crafted_item ? recipe.horde_crafted_item.id : null},
                    ${recipe.alliance_crafted_item ? recipe.alliance_crafted_item.id : null},
                    ${recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 0},
                    ${recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 0},
                    1,
                    CURRENT_TIMESTAMP,
                    null);
              `)
            .catch(console.error);
          Promise.all(
            queries.map(q =>
              db.query(q).catch(console.error)))
            .then(() => resolve())
            .catch(reject);
        });
  }

  update(data: Recipe): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  insert(data: Recipe): Promise<any> {
    return Promise.resolve(undefined);
  }

}
