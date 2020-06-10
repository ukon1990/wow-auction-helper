import {RecipeV2Util} from './recipev2.util';
import {Recipev2} from '../models/crafting/recipev2.model';
import {DatabaseUtil} from '../utils/database.util';
import {Recipe} from '../../../client/src/client/modules/crafting/models/recipe';

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
                keyMap[key] = setKeyMap(res[key], keyMap[key]);
            }
        } else {
            if (type === 'number' && key !== 'id') {
                if (keyMap[key]) {
                    keyMap[key] = keyMap[key] < res[key] ? res[key] : keyMap[key];
                } else {
                    keyMap[key] = res[key];
                }
            } else {
                keyMap[key] =  type;
            }
        }
    });
    return keyMap;
};

xdescribe('Recipev2Util', () => {
    describe('Not really tests', () => {/*
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
        });*/

        xit('insert all', async () => {
            jest.setTimeout(9999999);
            const db = new DatabaseUtil(false);
            await db.query(`
            SELECT data
            FROM recipe
            WHERE id NOT IN (SELECT id FROM recipes_new);`)
              .then(async r => {
                  const count = r.length;
                  let done = 0;

                  for (const recipe of r) {
                      const res: Recipev2 = JSON.parse(recipe.data);
                      await RecipeV2Util.generateQuery(res)
                        .then(async queries => {

                            for (const q of queries) {
                                await db.query(q)
                                  .catch(console.error);
                            }
                            done++;
                        })
                        .catch(console.error);
                      console.log('Done', done, count, `${Math.round(done / count * 100)}%`);
                  }
              })
              .catch(console.error);

            db.end();
            expect(1).toBe(2);
        });

        xit('Updating existing', async () => {
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
            FROM recipe;`)
                .then(r => {
                    r.forEach(recipe => {
                        const res: Recipev2 = JSON.parse(recipe.data);
                        recipes.push(res);
                        setKeyMap(res, keyMap);
                    });
                })
                .catch(console.error);
            console.log('Map is', JSON.stringify(keyMap));
            expect(keyMap['crafted_quantity'].maximum).toBeTruthy();
            expect(keyMap['crafted_quantity'].minimum).toBeTruthy();
            expect(recipes.length).toBe(7339);
        });

        it('getIcon', async () => {
            const icon = await RecipeV2Util.getIcon(1631);
            expect(icon).toBe('https://render-eu.worldofwarcraft.com/icons/56/inv_stone_sharpeningstone_01.jpg');
        });


        it('getAndMapProfessions',  async() => {
            jest.setTimeout(99999);
            const mapped = await RecipeV2Util.getAndMapProfessions();
            // console.log('mapped', JSON.stringify(mapped));
            expect(mapped).toBeTruthy();
        });
    });
});
