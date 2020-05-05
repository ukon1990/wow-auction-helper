import {format} from 'sqlstring';
import {Endpoints} from '../endpoints.util';
import {HttpClientUtil} from '../http-client.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {DatabaseUtil} from '../database.util';

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
                                        VALUES
                                        (?, ?);`, [recipe.id, JSON.stringify(recipe)]);

                    console.log('SQL', sql);
                    await conn.query(sql)
                        .then(() => resolve(recipe))
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    static mapToRecipe(recipe: Recipev2) {
        return undefined;
    }
}

