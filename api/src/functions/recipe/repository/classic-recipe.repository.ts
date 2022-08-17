import {Repository} from '../../../core/repository';
import {DatabaseUtil} from '../../../utils/database.util';
import {RDSQueryUtil} from '../../../utils/query.util';
import {format} from 'sqlstring';
import {Recipev2} from '../recipev2.model';
import {APIReagent, APIRecipe} from '../../../shared/models';

export class ClassicRecipeRepository extends Repository<APIRecipe> {

  constructor() {
    super('recipesClassic', 'recipesClassicName');
  }

  private geteBaseQuery(locale: string): string {
    return `
        SELECT COALESCE(retailName.id, recipes.id) as id,
               recipes.spellId as spellId,
               retail.icon                         as icon,
               name.${locale}                      as name,
               description.${locale}               as decription,
               recipes.craftedItemId               as craftedItemId,
               recipes.hordeCraftedItemId          as hordeCraftedItemId,
               recipes.allianceCraftedItemId       as allianceCraftedItemId,
               recipes.minCount                    as minCount,
               recipes.maxCount                    as maxCount,
               recipes.procRate                    as procRate,
               recipes.professionId                as professionId,
               retail.professionSkillTierId        as professionSkillTierId,
               skillTier.id                        as skillTierId,
               recipes.timestamp                   as timestamp
        FROM recipesClassic recipes
                 LEFT JOIN recipesClassicName name ON recipes.id = name.id
                 LEFT JOIN recipesName retailName ON name.en_GB = retailName.en_GB
                 LEFT JOIN recipes retail ON retail.id = retailName.id
                 LEFT JOIN recipesDescription as description ON description.id = recipes.id
                 LEFT JOIN professionSkillTiers as skillTier ON skillTier.id = retail.professionSkillTierId
        WHERE (recipes.craftedItemId > 0 OR recipes.professionId = 333)
          AND name.en_GB NOT LIKE '%DND%'
          AND name.en_GB NOT LIKE '%Test%'
          AND name.en_GB NOT LIKE '%UNUSED%'`;
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
      const date = isNaN(unix) ? 0 : Math.round(unix / 1000);
      db.query(`${this.geteBaseQuery(locale)}
          AND UNIX_TIMESTAMP(recipes.timestamp) > ${date}
          ORDER BY recipes.timestamp DESC;`)
        .then((recipes: APIRecipe[]) => {
          const map = {};
          recipes.forEach(recipe => {
            map[recipe.spellId * -1] = recipe;
          });

          db.query(`
              SELECT *
              FROM reagentsClassic reagents
                       LEFT JOIN recipesClassic recipes ON recipes.id = reagents.recipeId
              WHERE UNIX_TIMESTAMP(timestamp) > ${date};`)
            .then((reagents: any[]) => {
              reagents.forEach(r => {
                if (!map[r['recipeId']]) {
                  return;
                }
                if (!map[r['recipeId']].reagents) {
                  map[r['recipeId']].reagents = [];
                }
                map[r['recipeId']].reagents.push({
                  id: r.itemId,
                  quantity: r.quantity
                });
              });
              resolve(recipes);
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
        queries.push(`DELETE
                      FROM \`wah\`.\`reagents\`
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

      if (recipe.modified_crafting_slots) {
        recipe.modified_crafting_slots.forEach(slot => queries.push(
          new RDSQueryUtil('recipesModifiedCraftingSlot', false).insert({
            id: slot.slot_type.id,
            recipeId: recipe.id,
            sortOrder: slot.display_order,
          })
        ));
      }
      await db.query(`INSERT INTO recipes(id,
                                          icon,
                                          rank,
                                          craftedItemId,
                                          hordeCraftedItemId,
                                          allianceCraftedItemId,
                                          minCount,
                                          maxCount,
                                          procRate,
                                          timestamp,
                                          professionSkillTierId)
                      VALUES (${recipe.id},
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
                      ON DUPLICATE KEY UPDATE minCount  = ${recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 0},
                                              maxCount  = ${recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 0},
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

  update(data: APIRecipe): Promise<APIRecipe> {
    return Promise.resolve(undefined);
  }

  insert(data: APIRecipe): Promise<any> {
    return Promise.resolve(undefined);
  }

}