import {RecipeV2Util} from './recipev2.util';
import {Recipev2} from '../../models/crafting/recipev2.model';
import {DatabaseUtil} from '../database.util';

describe('Recipev2Util', () => {
    it('Can get recipe', async () => {
        const recipe: Recipev2 = await RecipeV2Util.getRecipeFromAPI(1631);
        expect(recipe.id).toBe(1631);
    });

    it('add for range', async () => {
        jest.setTimeout(10000000);
        const conn = new DatabaseUtil(false),
            increment = 200000,
            start = 13588,
            end = start + increment;
        let completed = 0, found = 0;

        for (let i = start; i < end; i++) {
            await RecipeV2Util.addToDB(i, conn)
                .then(() => {
                    found++;
                })
                .catch(() => {
                });
            completed++;
            console.log('Procesed', completed, '/', increment,
                `(${((completed / increment) * 100).toFixed(2)}%) id=${start + i} found=${found}`);
        }
        conn.end();

        expect(completed).toBe(increment);
    });
});
