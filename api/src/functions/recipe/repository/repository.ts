import {Repository} from '../../../core/repository';
import {DatabaseUtil} from '../../../utils/database.util';
import {RDSQueryUtil} from '../../../utils/query.util';
import {format} from 'sqlstring';
import {Recipev2} from '../recipev2.model';
import {APIReagent, APIRecipe} from '../../../shared/models';

export class RecipeRepository extends Repository<APIRecipe> {

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

  delete(id: number): Promise<APIRecipe> {
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
  getAllAfter(timestamp: number, locale: string, db: DatabaseUtil): Promise<APIRecipe[]> {
    return new Promise<APIRecipe[]>((resolve, reject) => {
      const unix = +new Date(timestamp);
      console.log('unix', unix);
      const date = isNaN(unix) ? 0 : Math.round( unix / 1000);
      db.query(`${this.geteBaseQuery(locale)}
          WHERE UNIX_TIMESTAMP(recipes.timestamp) > ${date}
          ORDER BY recipes.timestamp DESC;`)
        .then((recipes: APIRecipe[]) => {
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


                db.query(`
                  SELECT bonusId, recipeId
                  FROM recipesBonusId;
                `)
                      .then((bonusIds: {bonusId, recipeId}[]) => {
                        bonusIds.forEach(bonus => {
                          const recipe = (map[bonus.recipeId] as APIRecipe);
                          if (!recipe.bonusIds) {
                            recipe.bonusIds = [];
                          }
                          recipe.bonusIds.push(bonus.bonusId);
                        });
                        resolve(recipes);
                      })
                      .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getById(id: number, locale: string, db: DatabaseUtil): Promise<APIRecipe> {
    return new Promise<APIRecipe>((resolve, reject) => {
      db.query(`${this.geteBaseQuery(locale)}
        WHERE recipes.id = ${id};`)
        .then((recipes: APIRecipe[]) => {
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
                  reagents: reagents.map((reagent: APIReagent) => ({
                    ...reagent,
                    isOptional: !!reagent.isOptional
                  }))
                } as APIRecipe);
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
            queries.push(`DELETE FROM \`wah\`.\`reagents\`
                            WHERE recipeId = ${recipe.id};`);
            recipe.reagents.map(r => queries.push(format(`
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

          this.getModifiedCraftingSlotQueries(recipe, queries);
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
                    null)
            ON DUPLICATE KEY UPDATE
                minCount = ${recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 0},
                maxCount = ${recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 0},
                timestamp = CURRENT_TIMESTAMP;
              `)
            .catch(console.error);
          Promise.all(
            queries.map(q =>
              db.query(q).catch(console.error)))
            .then(() => resolve())
            .catch(reject);
        });
  }

  getModifiedCraftingSlotQueries(recipe: Recipev2, queries: string[]) {
    if (recipe.modified_crafting_slots) {
      recipe.modified_crafting_slots.forEach(slot => queries.push(
        new RDSQueryUtil('recipesModifiedCraftingSlot', false).insert({
          id: slot.slot_type.id,
          recipeId: recipe.id,
          sortOrder: slot.display_order,
        })
      ));
    }
  }

  update(data: APIRecipe): Promise<APIRecipe> {
    return Promise.resolve(undefined);
  }

  insert(data: APIRecipe): Promise<any> {
    return Promise.resolve(undefined);
  }

}