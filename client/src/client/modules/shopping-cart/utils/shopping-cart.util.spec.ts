import {AuctionItem} from '../../auction/models/auction-item.model';
import {ShoppingCartUtil} from './shopping-cart.util';
import {CartRecipe, ShoppingCartV2} from '../models/shopping-cart-v2.model';
import {Recipe} from '../../crafting/models/recipe';
import {Auction} from '../../auction/models/auction.model';
import {Reagent} from '../../crafting/models/reagent';
import {Item} from '@shared/models';

describe('ShoppingCartUtil', () => {
  const auctionMap = new Map<string, AuctionItem>();
  const recipeMap = new Map<number, Recipe>();
  let util: ShoppingCartUtil;

  beforeEach(() => {
    auctionMap.clear();
    recipeMap.clear();

    const recipe = new Recipe();
    recipe.id = 1000;
    recipe.reagents.push(new Reagent(2, 10));
    recipe.reagents.push(new Reagent(3, 5));
    recipeMap.set(recipe.id, recipe);

    const firstItem = new AuctionItem(1);
    firstItem.name = 'test';
    firstItem.buyout = 500;
    firstItem.mktPrice = 10;
    firstItem.auctions.push(new Auction(1, 1, 20, 500));
    firstItem.source.recipe.known = [recipe];
    auctionMap.set('' + firstItem.itemID, firstItem);


    const secondItem = new AuctionItem(2);
    secondItem.buyout = 20;
    secondItem.mktPrice = 20;
    secondItem.auctions.push(new Auction(1, 2, 5, 1));
    secondItem.auctions.push(new Auction(1, 2, 10, 11));
    secondItem.auctions.push(new Auction(1, 2, 15, 50));
    auctionMap.set('' + secondItem.itemID, secondItem);

    const thirdItem = new AuctionItem(3);
    thirdItem.bid = 55;
    thirdItem.buyout = 60;
    thirdItem.mktPrice = 71;
    thirdItem.auctions.push(new Auction(2, 3, 3, 15));
    auctionMap.set('' + thirdItem.itemID, secondItem);

  });

  beforeEach(() => {
    util = new ShoppingCartUtil();
  });

  it('Can get a basic Shopping cart', () => {
    const recipes: CartRecipe[] = [{
      id: 1000,
      quantity: 2,
      isIntermediate: false
    }];
    const cart: ShoppingCartV2 = util.calculateSources(
      recipeMap,
      auctionMap,
      new Map<number, AuctionItem[]>(),
      new Map<number, Item>(),
      false,
      recipes,
      []);
    console.log({
      cart,
      auctionMap,
      recipeMap
    });
    expect(cart.profit).toBe(10);
    expect(cart.sumCost).toBe(10);
  });
});