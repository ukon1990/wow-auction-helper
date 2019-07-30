import {MockLoaderUtil} from '../../../mocks/mock-loader.util';
import {SharedService} from '../../../services/shared.service';
import {ItemInventory} from '../../../models/item/item';
import {Recipe} from '../../crafting/models/recipe';
import {ShoppingCart} from './shopping-cart.model';

describe('ShoppingCartUtil', () => {
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
      'Draenor': {
        158188: inventoryItem
      }
    };

    SharedService.items[39354].itemSource = {
      soldBy: [{
        id: 66,
        location: [12],
        maxlevel: 10,
        minlevel: 10,
        name: 'Tharynn Bouden',
        react: [1, -1],
        tag: 'Trade Supplies',
        stock: -1,
        cost: 15,
        stack: 5
      }]
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

  describe('upgrade', () => {
    it('Can upgrade', () => {
      const oldData = {
        'recipes': [{
          'quantity': 1,
          'intermediateCount': 0,
          'reagents': [{
            'intermediateCount': 0,
            'itemID': 39354,
            'quantity': 1
          }, {
            'intermediateCount': 0,
            'itemID': 158188,
            'quantity': 8
          }],
          'spellID': 264766,
          'itemID': 158201
        }, {
          'quantity': 1,
          'intermediateCount': 0,
          'reagents': [{
            'intermediateCount': 0,
            'itemID': 152877,
            'quantity': 4
          }, {
            'intermediateCount': 0,
            'itemID': 152876,
            'quantity': 3
          }, {
            'intermediateCount': 0,
            'itemID': 152875,
            'quantity': 15
          }],
          'spellID': 255098,
          'itemID': 153442
        }],
        'reagents': [{
          'intermediateCount': 0,
          'itemID': 39354,
          'quantity': 1
        }, {
          'intermediateCount': 0,
          'itemID': 158188,
          'quantity': 8
        }, {
          'intermediateCount': 0,
          'itemID': 152877,
          'quantity': 4
        }, {
          'intermediateCount': 0,
          'itemID': 152876,
          'quantity': 3
        }, {
          'intermediateCount': 0,
          'itemID': 152875,
          'quantity': 15
        }],
        'items': []
      };
      cart.upgrade(oldData);
      expect(cart.recipes.length).toBe(2);
      expect(cart.reagents.length).toBe(5);
    });
  });

  describe('calculateCost', () => {
    beforeEach(() => {
      cart.add(recipe, 2);
    });

    it('Can calculate cost from vendor', () => {
      cart.calculateCosts();
      expect(cart.sources.vendor[0].cost).toBe(30);
    });

    it('Can calculate cost from ah', () => {
      cart.calculateCosts();
      console.log('auctionhouse', SharedService.auctionItemsMap[158188]);
      expect(cart.sources.ah[0].cost).toBe(2249995);
    });

    it('Can calculate the total cost', () => {
      cart.calculateCosts();
      expect(cart.sumCost).toBe(2249995 + 30);
    });
  });

  describe('setSources', () => {
    beforeEach(() => {
      cart.add(recipe, 2);
    });

    it('can get items to get from inventory', () => {
      expect(cart.sources.inventory[0].quantity).toBe(4);
      expect(cart.sources.ah[0].quantity).toBe(12);
      expect(cart.sources.vendor[0].quantity).toBe(2);
    });
  });

  describe('getSumCostOfItem', () => {
    it('Can calculate cost with only lowest buyout as price', () => {
      expect(0).toBe(0);
    });

    it('Can calculate cost by counting up form the lowest price', () => {
      expect(0).toBe(0);
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
