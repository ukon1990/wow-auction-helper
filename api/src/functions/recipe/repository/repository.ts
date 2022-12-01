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
    return `SELECT
							recipes.id            AS id,
							recipes.icon          AS icon,
							name.${locale}        AS name,
							description.${locale} AS decription,
							rank,
							craftedItemId,
							hordeCraftedItemId,
							allianceCraftedItemId,
							minCount,
							maxCount,
							procRate,
							professions.id        AS professionId,
							skillTier.id          AS skillTierId,
							recipes.timestamp     AS timestamp
						FROM recipes
								 LEFT JOIN recipesName AS name ON name.id = recipes.id
								 LEFT JOIN recipesDescription AS description ON description.id = recipes.id
								 LEFT JOIN professionSkillTiers AS skillTier ON skillTier.id = recipes.professionSkillTierId
								 LEFT JOIN professions ON professions.id = skillTier.professionId`;
  }

  delete(_id: number): Promise<APIRecipe> {
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
								SELECT
									id,
									sortOrder,
									recipeId
								FROM recipesModifiedCraftingSlot;
              `)
                .then((modifiers: { id, sortOrder, recipeId }[]) => {
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
										SELECT
											bonusId,
											recipeId
										FROM recipesBonusId;
                  `)
                    .then((bonusIds: { bonusId, recipeId }[]) => {
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
							SELECT
								itemId AS id,
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
        new RDSQueryUtil('recipesName', false).insertOrUpdate({
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
        queries.push(new RDSQueryUtil('recipesDescription', false).insertOrUpdate({
          id: recipe.id,
          ...recipe.description
        }));
      }

      this.getModifiedCraftingSlotQueries(recipe, queries);
      const insertRecipes = new RDSQueryUtil('recipes', true).insertOrUpdate({
        id: recipe.id,
        icon: recipe.media ? recipe.media.icon : null,
        rank: recipe.rank || 0,
        craftedItemId: recipe.crafted_item ? recipe.crafted_item.id : undefined,
        hordeCraftedItemId: recipe.horde_crafted_item ? recipe.horde_crafted_item.id : undefined,
        allianceCraftedItemId: recipe.alliance_crafted_item ? recipe.alliance_crafted_item.id : undefined,
        minCount: recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 1,
        maxCount: recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 1,
        procRate: 1,
        professionSkillTierId: null // This and type is defined from another call
      });
      await db.query(insertRecipes)
        .then(async () => {
          for (const query of queries) {
            await db.query(query).catch(error => {
              console.error(error);
              console.error('For query: ' + query);
            });
          }
          resolve();
        })
        .catch(reject);
    });
  }

  getModifiedCraftingSlotQueries(recipe: Recipev2, queries: string[]) {
    if (recipe.modified_crafting_slots) {
      recipe.modified_crafting_slots.forEach(slot => {
        queries.push(
          new RDSQueryUtil('recipesModifiedCraftingSlot', false).insertOrUpdate({
            id: slot.slot_type.id,
            recipeId: recipe.id,
            sortOrder: slot.display_order,
          })
        );
        queries.push(
          `INSERT INTO modifiedCraftingSlotType(id)
					 VALUES (${slot.slot_type.id})
					 ON DUPLICATE KEY UPDATE id = id`);
        queries.push(
          new RDSQueryUtil('modifiedCraftingSlotTypeName', false)
            .insertOrUpdate({id: slot.slot_type.id, ...slot.slot_type.name}));
        queries.push(
          new RDSQueryUtil('modifiedCraftingSlotTypeDescription', false)
            .insertOrUpdate({id: slot.slot_type.id, ...slot.slot_type.description}));

        (slot?.slot_type?.compatible_categories || []).forEach(category => {
          queries.push(
            `INSERT INTO modifiedCraftingCompatibleCategory(id)
					 VALUES (${category.id})
					 ON DUPLICATE KEY UPDATE id = id`);
          queries.push(
            new RDSQueryUtil('modifiedCraftingCompatibleCategoryName', false)
              .insertOrUpdate({id: category.id, ...category.name}));
          queries.push(
            new RDSQueryUtil('modifiedCraftingSlotTypeCompatibleCategory', false)
              .insertOrUpdate({compatibleCategoryId: category.id, slotTypeId: slot.slot_type.id}));
        });
      });
    }
  }

  update(_data: APIRecipe): Promise<APIRecipe> {
    return Promise.resolve(undefined);
  }

  insert(_data: APIRecipe): Promise<any> {
    return Promise.resolve(undefined);
  }

}