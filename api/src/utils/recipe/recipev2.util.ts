import {format} from 'sqlstring';
import {Endpoints} from '../endpoints.util';
import {HttpClientUtil} from '../http-client.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {DatabaseUtil} from '../database.util';
import {QueryUtil} from '../query.util';

export class RecipeV2Util {

  static getRecipeFromAPI(id: number): Promise<Recipev2> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      // TODO: Fetch media
      const url = new Endpoints().getPath(`recipe/${id}`, 'eu', 'static');
      new HttpClientUtil().get(url)
        .then(({body}) => resolve(body))
        .catch(reject);
    });
  }

  static async addToDB(id: number, conn: DatabaseUtil = new DatabaseUtil()): Promise<Recipev2> {

    return new Promise(async (resolve, reject) => {
      RecipeV2Util.getRecipeFromAPI(id)
        .then(async recipe => {
          const sql = format(`
              INSERT INTO \`wah\`.\`recipe\`
              (\`id\`,
               \`data\`)
              VALUES (?, ?);`, [recipe.id, JSON.stringify(recipe)]);
          await conn.query(sql)
            .then(() => resolve(recipe))
            .catch(reject);
        })
        .catch(reject);
    });
  }

  static generateQuery(recipe: Recipev2): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.getIcon(recipe.id)
        .then(icon => {
          const queries = [
            `INSERT INTO recipes_new(
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
            new QueryUtil('recipesName', false).insert({
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
            ])))
          }

          if (recipe.description && recipe.description.en_GB) {
            queries.push(new QueryUtil('recipesDescription', false).insert({
                id: recipe.id,
                ...recipe.description
            }));
          }

          resolve(queries);
        })
        .catch(reject);
    });
  }

  static async getAndMapProfessions() {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints().getPath('profession/index', 'eu', 'static');
      const http = new HttpClientUtil();
      const recipeMap = {};
      try {
        const {body: professions} = await http.get(url);
        resolve(professions);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  static mapToRecipe(recipe: Recipev2) {
    const icon = this.getIcon(recipe.id);

    return undefined;
  }

  static update(id: any, conn: DatabaseUtil) {
    return new Promise((resolve, reject) => {
      RecipeV2Util.getRecipeFromAPI(id)
        .then(async recipe => {
          const sql = format(`
                      UPDATE recipe
                      SET data = ?
                      WHERE id = ?;`,
            [JSON.stringify(recipe), recipe.id]);
          conn.query(sql)
            .then(() => resolve(recipe))
            .catch(reject);
        })
        .catch(reject);
    });
  }

  static getIcon(id: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints().getPath('media/recipe/' + id, 'eu', 'static');
      new HttpClientUtil().get(
        url
      )
        .then(({body}) => resolve(body.assets[0].value))
        .catch(reject);
    });
  }
}

