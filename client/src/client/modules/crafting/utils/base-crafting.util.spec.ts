import {BaseCraftingUtil} from './base-crafting.util';
import {OptimisticCraftingUtil} from './optimistic-crafting.util';
import {Recipe} from '../models/recipe';
import {Reagent} from '../models/reagent';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Auction} from '../../auction/models/auction.model';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {NeededCraftingUtil} from './needed-crafting.util';
import {PessimisticCraftingUtil} from './pessimistic-crafting.util';
import {NpcService} from '../../npc/services/npc.service';
import {Item} from '@shared/models';

describe('BaseCraftingUtil', () => {
  let recipe: Recipe;
  let map: Map<string, AuctionItem>;
  const itemMap = new Map<number, Item>();
  beforeEach(() => {
    map = new Map<string, AuctionItem>();
    recipe = new Recipe();
    recipe.itemID = 1;
    recipe.minCount = 1;
    recipe.maxCount = 1;
    recipe.reagents = [
      new Reagent(2, 5),
      new Reagent(3, 50),
      new Reagent(4, 1)
    ];
    const vendor = new ItemNpcDetails();
    vendor.vendorAvailable = 0;
    vendor.vendorBuyPrice = 1;
    NpcService.itemNpcMap.value.set(4, vendor);
    const item1: AuctionItem = new AuctionItem(1),
      item2: AuctionItem = new AuctionItem(2),
      item3: AuctionItem = new AuctionItem(3),
      item4: AuctionItem = new AuctionItem(4);
    item1.auctions = [
      new Auction(0, 1, 10000, 10)
    ];
    item1.buyout = 10000 / 10;
    item1.quantityTotal = 10;

    item2.auctions = [
      new Auction(0, 2, 50, 5),
      new Auction(0, 2, 45, 3),
      new Auction(0, 2, 1000, 50)
    ];
    item2.buyout = 50 / 5;
    item2.quantityTotal = 58;

    item3.auctions = [
      new Auction(0, 3, 1, 1),
      new Auction(0, 3, 80, 40),
      new Auction(0, 3, 2700, 900)
    ];
    item3.buyout = 1;
    item3.quantityTotal = 941;

    item4.auctions = [
      new Auction(0, 3, 10000, 1000)
    ];
    item4.buyout = 10;
    item4.quantityTotal = 1000;
    map.set('1', item1);
    map.set('2', item2);
    map.set('3', item3);
  });

  beforeAll(
    () => {
    });

  describe('OptimisticCraftingUtil', () => {
    it('Can calculate', () => {
      const cost = 101;
      new OptimisticCraftingUtil(map, new Map<number, AuctionItem[]>(), itemMap, 0).calculate([recipe]);
      expect(recipe.cost).toBe(cost);
      expect(recipe.roi).toBe(map.get('1').buyout * 0.95 - cost);
    });
  });

  describe('NeededCraftingUtil', () => {
    it('Can calculate', () => {
      const cost = 159;
      new NeededCraftingUtil(map, new Map<number, AuctionItem[]>(), itemMap, 0).calculate([recipe]);
      expect(recipe.cost).toBe(cost);
      expect(recipe.roi).toBe(map.get('1').buyout * 0.95 - cost);
    });
  });

  describe('PessimisticCraftingUtil', () => {
    it('Can calculate', () => {
      const cost = 196;
      new PessimisticCraftingUtil(map, new Map<number, AuctionItem[]>(), itemMap, 0).calculate([recipe]);
      expect(recipe.cost).toBe(cost);
      expect(recipe.roi).toBe(map.get('1').buyout * 0.95 - cost);
    });
  });
});