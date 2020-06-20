import {RecipeService} from './service';

describe('RecipeService', () => {
  it('getById', async () => {
    const recipe = await RecipeService.getById(11976, 'en_GB');
    expect(recipe.name).toBe('Winter Veil Egg Nog');
    expect(recipe.reagents.length).toBe(4);
  });

  it('getAllAfter', async () => {
    const recipes = await RecipeService.getAllAfter(0, 'en_GB');
    expect(recipes.recipes.length).toBe(7339);
    expect(recipes[0].reagents.length).toBe(2);
  });
});
