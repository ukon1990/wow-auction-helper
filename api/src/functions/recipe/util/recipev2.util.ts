import {format} from 'sqlstring';
import {Endpoints} from '../../../utils/endpoints.util';
import {HttpClientUtil} from '../../../utils/http-client.util';
import {ReagentSlotType, Recipev2} from '../recipev2.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {DatabaseUtil} from '../../../utils/database.util';
import {RDSQueryUtil} from '../../../utils/query.util';
import {APIReagent, APIRecipe, ItemLocale} from '../../../shared/models';
import {NameSpace} from '../../../enums/name-space.enum';
import {RecipeService} from '../service/service';
import {ClassicRecipeUtil} from '@functions/recipe/util/classic-recipe.util';
import {SharedRecipeUtil} from '@functions/recipe/util/shared.util';
import PromiseThrottle from 'promise-throttle';

export class RecipeV2Util {

  static getRecipeFromAPI(id: number): Promise<Recipev2> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      // TODO: Fetch media
      const endpoints = new Endpoints();
      const url = endpoints.getPath(`recipe/${id}`, 'us', NameSpace.STATIC_RETAIL);
      console.log('URL', url);
      const http = new HttpClientUtil();
      http.get(url)
        .then(async ({body}) => {
          const recipe: Recipev2 = body;

          await this.getIcon(id)
            .then(async icon => {
              recipe.media.icon = icon;
            })
            .catch(console.error);
          for (const slot of (recipe.modified_crafting_slots || [])) {
            try {
              if (slot?.slot_type.key?.href) {
                await http.get<ReagentSlotType>(endpoints.getForKey(slot.slot_type.key.href))
                  .then(({body: slotType}) => {
                    slot.slot_type = {
                      ...slot.slot_type,
                      ...slotType,
                    };
                  })
                  .catch(console.error);
              }
            } catch (error) {
              console.error('Could not get slot type', endpoints.getForKey(slot.slot_type.key.href), error);
            }
          }

          resolve(recipe);
        })
        .catch(error => {
          console.error('RecipeV2Util.getRecipeFromAPI.get', url, id, error);
          reject(error);
        });
    });
  }

  /**
   * Gets recipe snot related to a profession from WoWHead
   */
  static getOnUseRecipes(): Promise<APIRecipe[]> {
    return new Promise<APIRecipe[]>((resolve) => {
      const url = 'https://www.wowhead.com/spells?filter=20:25;1:3;0:0';
      new HttpClientUtil().get(url, false)
        .then(async ({body}) => {
          const list = ClassicRecipeUtil.getList('', body);
          const recipes = await SharedRecipeUtil.mapResultToRecipe(list, -1, false);
          console.log('Found', recipes.length, 'recipes');
          resolve(recipes);
        })
        .catch((error) => {
          console.log('getOnUseRecipes.error', error);
          resolve([]);
        });
    });
  }

  static async addToDB(id: number, conn: DatabaseUtil = new DatabaseUtil()): Promise<Recipev2> {

    return new Promise(async (resolve, reject) => {
      RecipeV2Util.getRecipeFromAPI(id)
        .then(async recipe => {
          const queries = await RecipeV2Util.generateQuery(recipe);
          for (const q of queries) {
            await conn.query(q)
              .catch(console.error);
          }
          resolve(recipe);
        })
        .catch(reject);
    });
  }

  static generateQuery(recipe: Recipev2): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.getIcon(recipe.id)
        .then(icon => {
          const queries = [
            `INSERT INTO recipes(id,
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
										 "${icon}",
										 ${recipe.rank || 0},
										 ${recipe.crafted_item ? recipe.crafted_item.id : null},
										 ${recipe.horde_crafted_item ? recipe.horde_crafted_item.id : null},
										 ${recipe.alliance_crafted_item ? recipe.alliance_crafted_item.id : null},
										 ${recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 0},
										 ${recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 0},
										 1,
										 CURRENT_TIMESTAMP,
										 NULL);
            `,
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

          resolve(queries);
        })
        .catch(reject);
    });
  }

  /**
   * Used for updating the recipe table
   * with recipes from a new patch
   */
  static async getAndMapProfessions() {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const http = new HttpClientUtil(),
        db = new DatabaseUtil(false);
      await db.enqueueHandshake()
        .catch(reject);
      // const recipeMap = {};
      try {
        const result = [];
        const url = new Endpoints().getPath('profession/index', 'us', NameSpace.STATIC_RETAIL);
        console.log('URL is', url);
        const {body} = await http.get(url);
        const throttle = new PromiseThrottle({
          requestsPerSecond: 2,
          promiseImplementation: Promise
        });
        const recipePromises: Promise<any>[] = [];
        let completed = 0;

        for (const p of (body.professions || [])) {
          await http.get(
            new Endpoints().getPath('profession/' + p.id, 'us', NameSpace.STATIC_RETAIL))
            .then(async ({body: profession}) => {
              const res = {
                id: profession.id,
                name: profession.name as ItemLocale,
                description: profession.description,
                icon: await this.getIcon(profession.id, 'profession'),
                type: profession.type.type,
                skillTiers: [], // profession.skill_tiers
              };
              result.push(res);

              await db.query(
                new RDSQueryUtil('professions', false).insertOrUpdate({
                  id: res.id,
                  icon: res.icon,
                  type: res.type,
                })
              )
                .catch(console.error);

              await this.insertLocale(res.id, 'professionsName', res.name, db)
                .catch(console.error);

              if (res.description && res.description.en_GB) {
                await this.insertLocale(res.id, 'professionsDescription', res.description, db)
                  .catch(console.error);
              }

              if (profession && profession.skill_tiers) {
                for (const skill of profession.skill_tiers) {
                  const skillUrl = new Endpoints().getPath(
                    `profession/${profession.id}/skill-tier/${skill.id}`, 'us', NameSpace.STATIC_RETAIL);

                  await http.get(skillUrl)
                    .then(async ({body: s}) => {
                      const skillTier = {
                        id: s.id,
                        name: s.name,
                        min: s.minimum_skill_level,
                        max: s.maximum_skill_level,
                        recipes: []
                      };

                      await db.query(format(`
												INSERT INTO professionSkillTiers
												VALUES (?, ?, ?, ?)
												ON DUPLICATE KEY UPDATE id = id
                      `, [
                        s.id, res.id, s.minimum_skill_level, s.maximum_skill_level
                      ]))
                        .catch(console.error);
                      await this.insertLocale(s.id, 'professionSkillTiersName', skillTier.name, db)
                        .catch(console.error);

                      // Skipping over it if it's not Dragonflight recipes
                      if (skillTier.name.en_GB.indexOf('Dragon') === -1) {
                        return;
                      }

                      (s.categories || []).forEach(c =>
                        c.recipes.forEach(async r => {
                          skillTier.recipes.push(r.id);
                          recipePromises.push(throttle.add(() =>
                            new Promise<void>(async (success) => {
                              await RecipeService.getAndInsert(r.id, db)
                                .catch(console.error);

                              await db.query(
                                new RDSQueryUtil('recipes', false)
                                  .update(r.id, {
                                    professionSkillTierId: s.id,
                                    type: c.name.en_GB
                                  })
                              )
                                .catch(error =>
                                  console.error('Could not get recipe', r, error));
                              completed++;
                              console.log(`Attempting to insert, ${r.id}, ${r.name.en_GB
                              }, ${completed} / ${recipePromises.length} = ${
                                Math.round((completed / recipePromises.length) * 100)} % completed`);
                              success();
                            })));
                        }));
                      res.skillTiers.push(skillTier);
                    })
                    .catch(console.error);
                }
              }
            })
            .catch(console.error);
        }
        console.log('Inserting recipes');
        Promise.all(recipePromises)
          .then(() => {
            db.end();
            resolve(result);
          })
          .catch(reject);
      } catch (e) {
        db.end();
        console.error(e);
        reject(e);
      }
    });
  }

  private static insertLocale(id: number, table: string, locale: ItemLocale, db: DatabaseUtil): Promise<void> {
    const sql = new RDSQueryUtil(table, false)
      .insertOrUpdate({...locale, id});
    return db.query(sql);
  }

  static getIcon(id: number, type = 'recipe'): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints().getPath(`media/${type}/${id}`, 'us', NameSpace.STATIC_RETAIL);
      new HttpClientUtil().get(
        url
      )
        .then(({body}) => {
          if (body.assets && body.assets.length) {
            resolve(body.assets[0].value);
          }
          {
            reject({message: 'Missing', body});
          }
        })
        .catch(reject);
    });
  }


  /**
   * Mapping recipes from WoWHead into regular API Recipe Objects
   * @param recipes
   */
  static mapAPIRecipesToV2Recipes(recipes: APIRecipe[]): Recipev2[] {
    console.log('mapAPIRecipeToV2Recipe is', recipes);
    return (recipes || [])
      .filter(recipe =>
        !!recipe?.reagents && !!recipe?.reagents?.length)
      .map(this.mapAPIRecipeToV2Recipe);
  }

  private static mapAPIRecipeToV2Recipe(recipe: APIRecipe) {
    const getItem = (id: number) => id ? ({
      id,
      key: undefined,
      name: undefined,
    }) : null;
    const getReagent = (reagent: APIReagent) => ({
      reagent: getItem(reagent.id),
      quantity: reagent.quantity
    });

    return ({
      id: recipe.id,
      name: recipe.name as ItemLocale,
      description: undefined,
      media: null,
      reagents: recipe.reagents.map(getReagent),
      crafted_item: getItem(recipe.craftedItemId),
      horde_crafted_item: getItem(recipe.hordeCraftedItemId),
      alliance_crafted_item: getItem(recipe.allianceCraftedItemId),
      crafted_quantity: {
        value: Math.round((recipe.minCount + recipe.maxCount) / 2),
        minimum: recipe.minCount,
        maximum: recipe.maxCount,
      },
      modified_crafting_slots: [],
    });
  }

  static updateRecipe(recipe: APIRecipe): Promise<APIRecipe> {
    return new Promise<APIRecipe>((resolve, reject) => {
      if (recipe.id) {
        const query = new RDSQueryUtil('recipe')
          .update(recipe.id, recipe);
        new DatabaseUtil()
          .query(query)
          .then(() => resolve(recipe))
          .catch(reject);

        if (recipe.reagents && recipe.reagents.length) {
          console.warn('Updating reagents is not implemented yet');
        }
      } else {
        reject({code: 404, message: 'Could not find recipe with id ' + id});
      }
    });
  }
}