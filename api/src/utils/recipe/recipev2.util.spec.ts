import {RecipeV2Util} from './recipev2.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {DatabaseUtil} from '../database.util';
import {Recipe} from '../../../../client/src/client/modules/crafting/models/recipe';

const setKeyMap = (res: any, keyMap: {} = {}) => {
    Object.keys(res).forEach(key => {
        const type = typeof res[key];
        if (type === 'object' && key !== 'name' && key !== 'description') {
            if (res[key].forEach) {
                const arrayMap = {};
                res[key].forEach(entry =>
                    setKeyMap(entry, arrayMap));
                keyMap[key] = {
                    listOf: arrayMap
                };
            } else {
                keyMap[key] = setKeyMap(res[key]);
            }
        } else {
            keyMap[key] =  type;
        }
    });
    return keyMap;
};

describe('Recipev2Util', () => {
    describe('Not really tests', () => {
        xit('Can get recipe', async () => {
            const recipe: Recipev2 = await RecipeV2Util.getRecipeFromAPI(39416),
                recipeMapped: Recipe = RecipeV2Util.mapToRecipe(recipe);
            await RecipeV2Util.addToDB(39416, new DatabaseUtil())
                .catch(() => {
                });
            expect(recipe.id).toBe(1631);
            expect(recipeMapped.icon).toBe('asd');
        });

        xit('"bruteforce" recipes', async () => {
            jest.setTimeout(10000000);
            const conn = new DatabaseUtil(false),
                increment = 200000,
                start = 1353,
                end = 50000; // start + increment;
            let completed = 0, found = 0, lastId = 0;

            for (let i = start; i < end; i++) {
                await RecipeV2Util.addToDB(i, conn)
                    .then((recipe) => {
                        found++;
                        lastId = recipe.id;
                    })
                    .catch(() => {
                    });
                completed++;
                console.log('Procesed', completed, '/', end - start,
                    `(${((completed / (end - start)) * 100).toFixed(2)}%) id=${i
                    } found=${found
                    } last id was=${lastId
                    }`);
            }
            conn.end();

            expect(completed).toBe(increment);
        });

        it('Updating existing', async () => {
            jest.setTimeout(9999999);
            const db = new DatabaseUtil(false);
            const ids = await db.query('SELECT id FROM recipe;');
            let completed = 0;
            for (const {id} of ids) {
                await RecipeV2Util.update(id, db)
                    .catch(console.error);
                completed++;
                console.log(`Progrss ${Math.round(completed / ids.length * 100)}%`, completed, ids.length);
            }
            db.end();
            expect(completed).toBe(ids.length);
        });

        xit('map all recipe keys', async () => {
            const recipes: Recipev2[] = [],
                keyMap = {};
            await new DatabaseUtil().query(`
            SELECT data
            FROM wah.recipe;`)
                .then(r => {
                    r.forEach(recipe => {
                        const res: Recipev2 = JSON.parse(recipe.data);
                        recipes.push(res);
                        setKeyMap(res, keyMap);
                    });
                })
                .catch(console.error);
            console.log('Map is', JSON.stringify(keyMap));
            expect(recipes.length).toBe(7210);
        });


        it('getAndMapProfessions',  async() => {
            const mapped = await RecipeV2Util.getAndMapProfessions();
            console.log('mapped', mapped);
            expect(mapped).toBeTruthy();
        });
    });
});
