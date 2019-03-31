import {MockLoaderUtil} from '../mocks/mock-loader.util';
import {SharedService} from '../services/shared.service';
import {ItemInventory} from '../models/item/item';
import {Recipe} from '../models/crafting/recipe';

fdescribe('ShoppingCartUtil', () => {
  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
    const inventoryItem = new ItemInventory({
        id: 25,
        name: 'Item name',
        value: 10
      },
      'bags');

    SharedService.tsmAddonData.inventoryMap = {
      'Realm': {
        25: inventoryItem
      }
    };
  });

  describe('add', () => {
    it('Can add recipe', () => {
      const recipe: Recipe = SharedService.recipesMap[264769];
      expect(recipe.spellID).toBe(264769);
    });
  });

  describe('remove', () => {
  });
});
