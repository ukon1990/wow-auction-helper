import {MockLoaderUtil} from '../mocks/mock-loader.util';
import {SharedService} from '../services/shared.service';
import {ItemInventory} from '../models/item/item';
import {Recipe} from '../models/crafting/recipe';
import {ShoppingCart} from './shopping-cart.util';

fdescribe('ShoppingCartUtil', () => {
  let recipe: Recipe,
    cart: ShoppingCart,
    inventoryItem: ItemInventory;

  // 39354 light parchment

  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
    inventoryItem = new ItemInventory({
        id: 158188,
        name: 'Crimson Ink',
        value: 4
      },
      'bags');

    SharedService.tsmAddonData.inventoryMap = {
      'realm': {
        158188: inventoryItem
      }
    };
    recipe = SharedService.recipesMap[264769];
  });

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  describe('upgrade', () => {
    it('Can upgrade to the new version', () => {
    });
  });

  describe('add', () => {
    beforeEach(() => {
      cart.add(recipe, 2);
    });
    it('Can add recipe', () => {
      expect(cart.recipes.length).toBe(1);
      expect(cart.recipes[0].quantity).toBe(2);
      expect(cart.reagentMap[158188].quantity).toBe(16);
    });

    it('Adding existing recipe only increases the quantity', () => {
      cart.add(recipe, 2);
      expect(cart.recipes.length).toBe(1);
      expect(cart.recipes[0].quantity).toBe(4);
      expect(cart.reagentMap[158188].quantity).toBe(32);
    });

    it('can add sum recipe', () => {
      /* TODO: Remember to add stuff to known recipes
      const subRecipe = SharedService.itemRecipeMap[158188][0],
       oldROI = subRecipe.roi;
      subRecipe.roi = 50000;
      console.log('Recipe', SharedService.itemRecipeMap[158188][0]);
      expect(SharedService.itemRecipeMap[158188][0].roi).toBe(10);
      subRecipe.roi = oldROI;*/
    });
  });

  describe('split', () => {
    it('can get items to get from inventory', () => {
      expect(cart.sources.inventory[0].quantity).toBe(4);
      expect(cart.sources.ah[0].quantity).toBe(4);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      cart.add(recipe, 2);
    });

    it('can remove a single craft of a recipe', () => {
      cart.remove(recipe.spellID, 1);
      expect(cart.recipes[0].quantity).toBe(1);
      expect(cart.reagentMap[158188].quantity).toBe(8);
    });

    it('can remove all crafts of a recipe', () => {
      cart.remove(recipe.spellID);
      expect(cart.recipes.length).toBeFalsy();
      expect(cart.reagents.length).toBeFalsy();
    });

    it('can remove all crafts of a recipe, but keep reagent if in the cart via another', () => {
      cart.add(
        // Contract: Talanji's Expedition rank 3
        SharedService.recipesMap[256289]
      );
      expect(cart.recipes.length).toBe(2);
      cart.remove(recipe.spellID);
      expect(cart.recipes.length).toBe(1);
      expect(cart.reagents.length).toBe(3);
      expect(cart.reagentMap[158188].quantity).toBe(5);
    });

    it('can remove sub recipe', () => {
    });
  });
});
