import {RecipeV2Util} from './recipev2.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {DatabaseUtil} from '../database.util';
import {Recipe} from "../../../../client/src/client/modules/crafting/models/recipe";

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
    it('Can get recipe', async () => {
        const recipe: Recipev2 = await RecipeV2Util.getRecipeFromAPI(39416),
            recipeMapped: Recipe = RecipeV2Util.mapToRecipe(recipe);
        await RecipeV2Util.addToDB(39416, new DatabaseUtil())
            .catch(() => {
            });
        expect(recipe.id).toBe(1631);
        expect(recipeMapped.icon).toBe('asd');
    });

    it('"bruteforce" recipes', async () => {
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
            console.log('Procesed', completed, '/', increment,
                `(${((completed / increment) * 100).toFixed(2)}%) id=${i
                } found=${found
                } last id was=${lastId
                }`);
        }
        conn.end();

        expect(completed).toBe(increment);
    });

    it('map all recipe keys', async () => {
        const recipes: Recipev2[] = [],
            keyMap = {};
        await new DatabaseUtil().query(`
            SELECT data
            FROM wah.recipe_raw;`)
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


});
