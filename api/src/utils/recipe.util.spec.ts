import {RecipeUtil} from './recipe.util';

describe('Test', () => {
  it('getRecipeListForPatch', async () => {
    const list = await RecipeUtil.getRecipeListForPatch(80300);
    expect(list.length).toBe(7);
    expect(list[0].spellID).toBe(305936);
    expect(list[0].itemID).toBe(170312);
    expect(list[0].minCount).toBe(1);
    expect(list[0].maxCount).toBe(1);
    expect(list[1].name).toBe('Uncanny Combatant\'s Sorcerous Scepter');
    expect(list[0].rank).toBe(1);
    expect(list[1].rank).toBe(3);
    expect(list[2].rank).toBe(2);
  });
});
