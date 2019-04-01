import {MockLoaderUtil} from '../mocks/mock-loader.util';
import {SharedService} from '../services/shared.service';
import {ItemInventory} from '../models/item/item';
import {Recipe} from '../models/crafting/recipe';
import {ShoppingCart} from './shopping-cart.util';

fdescribe('ShoppingCartUtil', () => {
  let recipe: Recipe,
    cart: ShoppingCart;

  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
    const inventoryItem = new ItemInventory({
        id: 158188,
        name: 'Crimson Ink',
        value: 4
      },
      'bags');

    SharedService.tsmAddonData.inventoryMap = {
      'Realm': {
        25: inventoryItem
      }
    };
    recipe = SharedService.recipesMap[264769];
  });

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  describe('add', () => {
    it('Can add recipe', () => {
      cart.add(recipe, 2);
      expect(cart.recipes.length).toBe(1);
      expect(cart.recipes[0].quantity).toBe(2);
      expect(cart.reagentMap[158188].quantity).toBe(16);
    });

    it('Adding existing recipe only increases the quantity', () => {
      cart.add(recipe, 2);
      cart.add(recipe, 2);
      expect(cart.recipes.length).toBe(1);
      expect(cart.recipes[0].quantity).toBe(4);
      expect(cart.reagentMap[158188].quantity).toBe(32);
    });
  });

  describe('remove', () => {
  });
});
