import {Endpoints} from '../endpoints.util';
import {HttpClientUtil} from '../http-client.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {DatabaseUtil} from "../database.util";
import {safeifyString} from "../string.util";

export class RecipeV2Util {

    static getRecipeFromAPI(id: number): Promise<Recipev2> {
        return new Promise(async (resolve, reject) => {
            await AuthHandler.getToken();
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
                    await conn.query(`
                            INSERT INTO \`wah\`.\`recipe\`
                                        (\`id\`,
                                        \`data\`)
                                        VALUES
                                        (${recipe.id},
                                        "${safeifyString(JSON.stringify(recipe))}");`)
                        .then(() => resolve(recipe))
                        .catch(reject);
                })
                .catch(reject);
        });
    }
}

