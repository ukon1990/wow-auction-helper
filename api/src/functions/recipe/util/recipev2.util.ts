import {format} from 'sqlstring';
import {Endpoints} from '../../../utils/endpoints.util';
import {HttpClientUtil} from '../../../utils/http-client.util';
import {Recipev2} from '../recipev2.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {DatabaseUtil} from '../../../utils/database.util';
import {RDSQueryUtil} from '../../../utils/query.util';
import {ItemLocale} from '../../../shared/models';
import {NameSpace} from '../../../enums/name-space.enum';
import {RecipeService} from '../service/service';

export class RecipeV2Util {

  static getRecipeFromAPI(id: number): Promise<Recipev2> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      // TODO: Fetch media
      const url = new Endpoints().getPath(`recipe/${id}`, 'us', NameSpace.STATIC_RETAIL);
      new HttpClientUtil().get(url)
        .then(({body}) => {
          this.getIcon(id)
            .then(icon => {
              const recipe: Recipev2 = body;
              recipe.media.icon = icon;
              resolve(recipe);
            })
            .catch(reject);
        })
        .catch(error => {
            console.error('RecipeV2Util.getRecipeFromAPI.get', url, id, error);
            reject(error);
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
            `INSERT INTO recipes(
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
                    "${icon}",
                    ${recipe.rank || 0},
                    ${recipe.crafted_item ? recipe.crafted_item.id : null},
                    ${recipe.horde_crafted_item ? recipe.horde_crafted_item.id : null},
                    ${recipe.alliance_crafted_item ? recipe.alliance_crafted_item.id : null},
                    ${recipe.crafted_quantity ? recipe.crafted_quantity.minimum || recipe.crafted_quantity.value : 0},
                    ${recipe.crafted_quantity ? recipe.crafted_quantity.maximum || recipe.crafted_quantity.value : 0},
                    1,
                    CURRENT_TIMESTAMP,
                    null);
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
      const recipeMap = {};
      try {
        const result = [];
        const url = new Endpoints().getPath('profession/index', 'us', NameSpace.STATIC_RETAIL);
        console.log('URL is', url);
        const {body} = await http.get(url);

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

              await db.query(format(`INSERT INTO professions
                                     VALUES (?, ?, ?)`, [
                res.id,
                res.icon,
                res.type
              ]))
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
                        VALUES (?, ?, ?, ?)`, [
                        s.id, res.id, s.minimum_skill_level, s.maximum_skill_level
                      ]))
                        .catch(console.error);
                      await this.insertLocale(s.id, 'professionSkillTiersName', skillTier.name, db)
                        .catch(console.error);

                      // Skipping over it if it's not shadowlands recipes
                      /*
                      if (skillTier.name.en_GB.indexOf('Shadowlands') === -1) {
                        return;
                      }
                      */

                      (s.categories || []).forEach(c =>
                        c.recipes.forEach(async r => {
                          skillTier.recipes.push(r.id);
                          await RecipeService.getAndInsert(r.id, db)
                            .catch(console.error);
                          await db.query(format(`
                            UPDATE recipes
                            SET professionSkillTierId = ?,
                                type                  = ?
                            WHERE id = ?`, [
                            s.id, c.name.en_GB, r.id
                          ]))
                            .catch(error =>
                                console.error('Could not get recipe', r, error));
                        }));
                      res.skillTiers.push(skillTier);
                    })
                    .catch(console.error);
                }
              }
            })
            .catch(console.error);
        }
        db.end();
        resolve(result);
      } catch (e) {
        db.end();
        console.error(e);
        reject(e);
      }
    });
  }

  private static insertLocale(id: number, table: string, locale: ItemLocale, db: DatabaseUtil): Promise<void> {
    const sql = format(`INSERT INTO ${table} VALUES(
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id,
      locale.en_GB,
      locale.en_US,
      locale.de_DE,
      locale.es_ES,
      locale.es_MX,
      locale.fr_FR,
      locale.it_IT,
      locale.pl_PL,
      locale.pt_PT,
      locale.pt_BR,
      locale.ru_RU,
      locale.ko_KR,
      locale.zh_TW,
      locale.zh_CN,
    ]);
    console.log('sql', sql);
    return db.query(sql);
  }

  static mapToRecipe(recipe: Recipev2) {
    const icon = this.getIcon(recipe.id);

    return undefined;
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
          } {
            reject({message: 'Missing', body});
          }
        })
        .catch(reject);
    });
  }


}