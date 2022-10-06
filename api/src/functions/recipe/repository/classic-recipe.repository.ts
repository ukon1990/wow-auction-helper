import {Repository} from '../../../core/repository';
import {DatabaseUtil} from '../../../utils/database.util';
import {RDSQueryUtil} from '../../../utils/query.util';
import {format} from 'sqlstring';
import {APIReagent, APIRecipe, ItemLocale} from '../../../shared/models';

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

  insertData(recipe: APIRecipe, db: DatabaseUtil): Promise<void> {
    console.log('Recipe', recipe);
    // this.getIcon(recipe.id)
    return new Promise(async (resolve, reject) => {
      const queries = [
        new RDSQueryUtil('recipesClassicName', false).insertOrUpdate({
          ...recipe.name as ItemLocale,
          id: recipe.id,
        })
      ];

      if (recipe.reagents) {
        queries.push(`DELETE
                      FROM \`wah\`.\`reagentsClassic\`
                      WHERE recipeId = ${recipe.id};`);
        recipe.reagents.map((r) => queries.push(format(`
            INSERT INTO reagentsClassic
            VALUES (?, ?, ?, ?);
        `, [
          recipe.id,
          r.id,
          r.quantity,
          0
        ])));
      }
      const minCount = recipe.minCount || 0;
      const maxCount = recipe.maxCount || 0;
      await db.query(format(`
            INSERT INTO recipesClassic(
                                      id,
                                      icon,
                                      rank,
                                      craftedItemId,
                                      minCount,
                                      maxCount,
                                      procRate,
                                      timestamp,
                                      professionId,
                                      professionSkillTierId
                  )
                  VALUES (${recipe.id},
                          ?,
                          ${recipe.rank || 0},
                          ${recipe.craftedItemId || null},
                          ${minCount},
                          ${maxCount},
                          1,
                          CURRENT_TIMESTAMP,
                          ${recipe['professionId']},
                          null)
                  ON DUPLICATE KEY UPDATE minCount  = ${minCount},
                                          maxCount  = ${maxCount},
                                          timestamp = CURRENT_TIMESTAMP;
      `, [
        recipe?.icon || ''
      ]))
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