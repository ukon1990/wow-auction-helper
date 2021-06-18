/*
import {RecipeUtil} from './recipe.util';
import {S3Handler} from '../handlers/s3.handler';
import {languages} from '../static-data/language.data';
 */

import {ClassicRecipeUtil} from './classic-recipe.util';
import {GameBuild} from '../../../../client/src/client/utils/game-build.util';
import {RDSQueryUtil} from '../../utils/query.util';
import {ProfessionRepository} from '../../profession/repository';
import {DatabaseUtil} from '../../utils/database.util';
import {ItemLocale} from '../../models/item/item-locale';

describe('RecipeUtil', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  it('getRecipeListForPatch', async () => {
    const list = await ClassicRecipeUtil.getRecipeListForPatch(80300);
    expect(list.length).toBe(155);

    list.forEach(recipe => {
      expect(recipe.spellId).toBeTruthy();
      expect(recipe.craftedItemId).toBeTruthy();
      expect(recipe.minCount).toBeGreaterThanOrEqual(0);
      expect(recipe.maxCount).toBeGreaterThanOrEqual(0);
      expect(recipe.name).toBeTruthy();
      recipe.reagents.forEach(reagent => {
        expect(reagent.id).toBeTruthy();
        expect(reagent.quantity).toBeTruthy();
      });
    });

    const enchantingItemRank1 = list.filter(r => r.spellId === 305936)[0];
    const enchantingItemRank2 = list.filter(r => r.spellId === 305937)[0];
    const enchantingItemRank3 = list.filter(r => r.spellId === 305938)[0];
    expect(enchantingItemRank1.spellId).toBe(305936);
    expect(enchantingItemRank1.spellId).toBe(170312);
    expect(enchantingItemRank1.minCount).toBe(1);
    expect(enchantingItemRank1.maxCount).toBe(1);
    expect(enchantingItemRank1.name).toBe('Uncanny Combatant\'s Sorcerous Scepter');
    expect(enchantingItemRank1.rank).toBe(1);
    expect(enchantingItemRank2.rank).toBe(2);
    expect(enchantingItemRank3.rank).toBe(3);
  });

  it('Can get all classic recipes', async () => {
    jest.setTimeout(9000000);
    const recipesClassicRepo = new RDSQueryUtil('recipesClassic', true);
    const reagentsClassicRepo = new RDSQueryUtil('reagentsClassic', false);
    const recipesClassicNameRepo = new RDSQueryUtil('recipesClassicName', false);

    const recipes = await ClassicRecipeUtil.getRecipeListForPatch(
      0,
      'tbc',
      [GameBuild.professionsClassic[4]]
    );
    console.log('DOne fetching all recipes', recipes[0]);
    if (recipes[0].name['en_GB']) {

      const reagents: {itemId: number, recipeId: number, quantity: number, isOptional: number}[] = [];
      const names: ItemLocale[] = [];
      const recipeQueries: string = recipesClassicRepo.multiInsertOrUpdate(
        recipes.map(recipe => {

          recipe.reagents.forEach(reagent => {
            reagents.push({
              itemId: reagent.id,
              recipeId: recipe.id,
              quantity: reagent.quantity,
              isOptional: 0,
            });
          });

          names.push({
            ...recipe.name as unknown as ItemLocale,
            id: recipe.id,
          });

          return {
            id: recipe.id,
            spellId: recipe.spellId,
            craftedItemId: recipe.craftedItemId,
            minCount: recipe.minCount,
            maxCount: recipe.maxCount,
            procRate: recipe.procRate || 1,
            professionId: recipe.professionId
          };
        }), true);
      const reagentQueries: string = reagentsClassicRepo.multiInsertOrUpdate(reagents, false);
      const nameQueries: string = recipesClassicNameRepo.multiInsertOrUpdate(names, false);
      const db = new DatabaseUtil(false);
      await db.query(recipeQueries);
      await db.query(reagentQueries);
      await db.query(nameQueries);
      await db.end();

      /*
  languages.forEach(language => {
    language.locales.forEach(async locale => {
      console.log('Processing locale', locale);
      const list = recipes.map(recipe => ({
        spellID: recipe.spellId,
        itemID: recipe.craftedItemId,
        name: recipe.name[locale],
        minCount: recipe.minCount,
        maxCount: recipe.maxCount,
        rank: recipe.rank,
        reagents: recipe.reagents,
      }));
      await new S3Handler().save(list, `classic/recipes/${locale}.json.gz`,
        {region: '', url: ''})
        .then((success) => {
          console.log('Success!', success);
        })
        .catch(console.error);
        });
      });
      */
    }

    expect(recipes.length).toBeGreaterThan(0);
  });
});
