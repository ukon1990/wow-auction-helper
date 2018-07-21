import {
  async,
  TestBed
} from '@angular/core/testing';
import { User } from './user/user';
import { Recipe } from './crafting/recipe';
import { ShoppingCart } from './shopping-cart';
import { SharedService } from '../services/shared.service';
import { AuctionItem } from './auction/auction-item';

const bindingOfHaste: Recipe = {
  'spellID': 191014,
  'itemID': 128542,
  'name': 'Binding of Haste',
  'rank': 'Rank 3',
  'profession': 'Enchanting',
  'minCount': 1,
  'maxCount': 1,
  'reagents': [{
    'itemID': 124442,
    'name': 'Chaos Crystal',
    'dropped': false,
    'count': 4
  },
  {
    'itemID': 124440,
    'name': 'Arkhana',
    'dropped': false,
    'count': 35
  }],
  'cost': 14225000,
  'roi': 4146499,
  'mktPrice': 19480612,
  'buyout': 18371499,
  'avgDailySold': 24,
  'regionSaleRate': 0.6,
  'quantityTotal': 152,
  'regionSaleAvg': 14880878
};
const leyShatter: Recipe = {
  'spellID': 224199,
  'itemID': 124440,
  'name': 'Ley Shatter',
  'rank': '',
  'profession': 'Enchanting',
  'minCount': 3,
  'maxCount': 3,
  'reagents': [{
    'itemID': 124441,
    'name': 'Leylight Shard',
    'dropped': false,
    'count': 1
  }],
  'cost': 93333.33333333333,
  'roi': 39666.66666666667,
  'mktPrice': 166843,
  'buyout': 133000,
  'avgDailySold': 2773.67,
  'regionSaleRate': 0.61,
  'quantityTotal': 7770,
  'regionSaleAvg': 169459
};

describe('ShoppingCart', () => {
  beforeEach(() => {
    SharedService.user = new User();
    SharedService.user.useIntermediateCrafting = false;
    SharedService.recipesMapPerItemKnown[leyShatter.itemID] = leyShatter;
    SharedService.auctionItemsMap[124440] = new AuctionItem();
    SharedService.auctionItemsMap[124442] = new AuctionItem();
  });

  it('Adding recipes to the list, should workas expected', () => {
    const cart: ShoppingCart = new ShoppingCart();
    SharedService.user.useIntermediateCrafting = false;
    cart.addEntry(1, bindingOfHaste);
    expect(cart.reagents[1].quantity).toBe(35);
    cart.addEntry(1, bindingOfHaste);
    expect(cart.reagents[1].quantity).toBe(70);
  });

  it('Adding recipes to the list with intermediate craft, should workas expected', () => {
    const cart: ShoppingCart = new ShoppingCart();
    SharedService.user.useIntermediateCrafting = true;
    cart.addEntry(1, bindingOfHaste);
    expect(cart.reagents[1].quantity).toBe(11.667);
    cart.addEntry(1, bindingOfHaste);
    expect(cart.reagents[1].quantity).toBe(23.334);
  });

  it('Can remove recipe', () => {
    const cart: ShoppingCart = new ShoppingCart();
    SharedService.user.useIntermediateCrafting = true;
    cart.addEntry(1, bindingOfHaste);
    cart.addEntry(1, bindingOfHaste);
    cart.removeRecipe(cart.recipesMap[bindingOfHaste.spellID], 0);
    expect(cart.recipes.length).toBe(0);
    expect(cart.reagents.length).toBe(0);
  });
});
