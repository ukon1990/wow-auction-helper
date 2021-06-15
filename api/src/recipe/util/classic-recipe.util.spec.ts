/*
import {RecipeUtil} from './recipe.util';
import {S3Handler} from '../handlers/s3.handler';
import {languages} from '../static-data/language.data';
 */

import { languages } from '../../static-data/language.data';
import {ClassicRecipeUtil} from './classic-recipe.util';

describe('RecipeUtil', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  it('getRecipeListForPatch', async () => {
    const list = await ClassicRecipeUtil.getRecipeListForPatch(80300);
    expect(list.length).toBe(155);

    list.forEach(recipe => {
      expect(recipe.spellID).toBeTruthy();
      expect(recipe.itemID).toBeTruthy();
      expect(recipe.minCount).toBeGreaterThanOrEqual(0);
      expect(recipe.maxCount).toBeGreaterThanOrEqual(0);
      expect(recipe.name).toBeTruthy();
      expect(recipe.profession).toBeTruthy();
      recipe.reagents.forEach(reagent => {
        expect(reagent.itemID).toBeTruthy();
        expect(reagent.count).toBeTruthy();
      });
    });

    const enchantingItemRank1 = list.filter(r => r.spellID === 305936)[0];
    const enchantingItemRank2 = list.filter(r => r.spellID === 305937)[0];
    const enchantingItemRank3 = list.filter(r => r.spellID === 305938)[0];
    expect(enchantingItemRank1.spellID).toBe(305936);
    expect(enchantingItemRank1.itemID).toBe(170312);
    expect(enchantingItemRank1.minCount).toBe(1);
    expect(enchantingItemRank1.maxCount).toBe(1);
    expect(enchantingItemRank1.name).toBe('Uncanny Combatant\'s Sorcerous Scepter');
    expect(enchantingItemRank1.rank).toBe(1);
    expect(enchantingItemRank2.rank).toBe(2);
    expect(enchantingItemRank3.rank).toBe(3);
  });

  it('Can get all classic recipes', async () => {
    jest.setTimeout(9000000);
    const recipes = await ClassicRecipeUtil.getRecipeListForPatch(0, 'classic');
    console.log('DOne fetching all recipes', recipes[0]);
    if (recipes[0].name['en_GB']) {
      languages.forEach(language => {
        language.locales.forEach(async locale => {
          console.log('Processing locale', locale);
          const list = recipes.map(recipe => ({
            spellID: recipe.spellID,
            itemID: recipe.itemID,
            name: recipe.name[locale],
            minCount: recipe.minCount,
            maxCount: recipe.maxCount,
            rank: recipe.rank,
            profession: recipe.profession,
            reagents: recipe.reagents,
            expansion: recipe.expansion
          }));

          await new S3Handler().save(list, `classic/recipes/${locale}.json.gz`,
            {region: '', url: ''})
            .then((success) => {
              console.log('Success!', success);
            })
            .catch(console.error);
        });
      });
    }

    expect(recipes.length).toBeGreaterThan(0);
  });
});
