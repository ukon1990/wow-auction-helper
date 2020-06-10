import {OldRecipeUtil} from './old-util';

describe('RecipeUtil', () => {
  beforeAll(() => {
    jest.setTimeout(90000);
  });

  xit('getRecipeListForPatch', async () => {
    const list = await OldRecipeUtil.getRecipeListForPatch(80300);
    expect(list.length).toBe(155);
    console.log('ids', list.map(l => l.spellID).join(','));

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
    expect(enchantingItemRank1.name['en_GB']).toBe('Uncanny Combatant\'s Sorcerous Scepter');
    expect(enchantingItemRank1.rank).toBe(1);
    expect(enchantingItemRank2.rank).toBe(2);
    expect(enchantingItemRank3.rank).toBe(3);
  });
});
