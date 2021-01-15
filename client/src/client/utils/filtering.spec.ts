import {SharedService} from '../services/shared.service';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {Filters} from './filtering';
import {Item} from '../models/item/item';
import {Recipe} from '../modules/crafting/models/recipe';
import {MockLoaderUtil} from '../mocks/mock-loader.util';
import {AuctionsService} from '../services/auctions.service';
import {TestBed} from '@angular/core/testing';

describe('Filters', () => {
  let service: AuctionsService;

  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuctionsService);
  });

  describe('isSaleRateMatch', () => {
    describe('Positive when', () => {
      it('null or undefined', () => {
        expect(Filters.isSaleRateMatch(25, undefined)).toBeTruthy();
        expect(Filters.isSaleRateMatch(25, null)).toBeTruthy();
      });

      it('No API is positive', () => {
        SharedService.user.apiToUse = 'Testing';
        const ai = new AuctionItem();
        ai.regionSaleRate = 0.10;
        ai.itemID = 25;
        service.mapped.value.set('' + ai.itemID, ai);
        expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeTruthy();
      });

      it('When an auction item is equal set value, true shall be returned', () => {
        const ai = new AuctionItem();
        ai.regionSaleRate = 0.09;
        ai.itemID = 25;
        service.mapped.value.set('' + ai.itemID, ai);
        expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeTruthy();
      });

      it('When an auction item is above set value, true shall be returned', () => {
        const ai = new AuctionItem();
        ai.regionSaleRate = 0.10;
        ai.itemID = 25;
        service.mapped.value.set('' + ai.itemID, ai);
        expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeTruthy();
      });

      it('if saleRate undefined or null it is positive', () => {
        const ai = new AuctionItem();
        ai.regionSaleRate = 0.08;
        ai.itemID = 25;
        expect(Filters.isSaleRateMatch(ai.itemID, null)).toBeTruthy();
        expect(Filters.isSaleRateMatch(ai.itemID, undefined)).toBeTruthy();
      });
    });

    it('Negative when', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.08;
      ai.itemID = 25;
      service.mapped.value.set('' + ai.itemID, ai);
      expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeFalsy();

      expect(Filters.isSaleRateMatch(123, 90)).toBeFalsy();
      SharedService.user.apiToUse = 'Testing';
    });
  });

  describe('isItemClassMatch', () => {
    it('Should accept all item classes with a -1 or null value', () => {
      const ai = new AuctionItem();
      SharedService.items[25] = new Item();
      SharedService.items[25].itemClass = 1;
      ai.itemID = 25;
      service.mapped.value.set('' + ai.itemID, ai);

      expect(Filters.isItemClassMatch(ai.itemID, null, null)).toBeTruthy();
      expect(Filters.isItemClassMatch(ai.itemID, -1, undefined)).toBeTruthy();
    });
  });

  describe('isItemAboveQuality', () => {
    it('should be able to filter for minimum item quality', () => {
      SharedService.items[25] = new Item();
      SharedService.items[25].quality = 3;
      expect(Filters.isItemAboveQuality(25, 1)).toBeTruthy();
    });
  });

  describe('isProfitMatch', () => {
    it('Positive when', () => {
      const recipe = new Recipe();
      recipe.itemID = 25;
      recipe.cost = 100;
      recipe.buyout = 200;
      recipe.roi = 100;
      expect(Filters.isProfitMatch(recipe, undefined, 1)).toBeTruthy();
      SharedService.itemRecipeMap[recipe.itemID] = [recipe];
      expect(Filters.isProfitMatch(undefined, recipe.itemID, 1)).toBeTruthy();
      expect(Filters.isProfitMatch(recipe, undefined, 0)).toBeTruthy();
      expect(Filters.isProfitMatch(recipe, undefined, null)).toBeTruthy();
      expect(Filters.isProfitMatch(recipe, undefined, undefined)).toBeTruthy();
    });

    it('Negative when', () => {
      const recipe = new Recipe();
      recipe.cost = 300;
      recipe.buyout = 200;
      recipe.roi = -100;
      expect(Filters.isProfitMatch(recipe, undefined, 1)).toBeFalsy();
      expect(Filters.isProfitMatch(undefined, undefined, 1)).toBeFalsy();
    });
  });

  describe('isExpansionMatch', () => {
    it('Positive match when', () => {
      SharedService.items[25] = new Item();
      SharedService.items[25].expansionId = 3;
      expect(Filters.isExpansionMatch(25, 3)).toBeTruthy();
      expect(Filters.isExpansionMatch(25, -1)).toBeTruthy();
      expect(Filters.isExpansionMatch(25, null)).toBeTruthy();
      expect(Filters.isExpansionMatch(25, undefined)).toBeTruthy();
    });


    it('Negative match when', () => {
      SharedService.items[25] = new Item();
      SharedService.items[25].expansionId = 3;
      expect(Filters.isExpansionMatch(25, 0)).toBeFalsy();
      expect(Filters.isExpansionMatch(25, 2)).toBeFalsy();
    });

    describe('isProfessionMatch', () => {
      let recipe: Recipe;
      beforeEach(() => {
        recipe = new Recipe();
        recipe.itemID = 25;
        recipe.professionId = 1;
        SharedService.itemRecipeMap[25] = [recipe];
      });

      it('Positive match when', () => {
        expect(Filters.isProfessionMatch(recipe.itemID, 1)).toBeTruthy();
        expect(Filters.isProfessionMatch(recipe.itemID, 0)).toBeTruthy();
        expect(Filters.isProfessionMatch(recipe.itemID, null)).toBeTruthy();
        expect(Filters.isProfessionMatch(recipe.itemID, undefined)).toBeTruthy();

        recipe.professionId = undefined;
        expect(Filters.isProfessionMatch(recipe.itemID, -1)).toBeTruthy();
      });

      it('Negative match when', () => {
        expect(Filters.isProfessionMatch(recipe.itemID, 33)).toBeFalsy();
        expect(Filters.isProfessionMatch(recipe.itemID, 66)).toBeFalsy();


        SharedService.itemRecipeMap[25] = [];
        expect(Filters.isProfessionMatch(recipe.itemID, 1)).toBeFalsy();
        SharedService.itemRecipeMap[25] = undefined;
        expect(Filters.isProfessionMatch(recipe.itemID, 1)).toBeFalsy();
      });
    });
  });

  describe('isDailySoldMatch', () => {
    beforeEach(() => {
      const auctionItem: AuctionItem = new AuctionItem();
      auctionItem.avgDailySold = 40;
      service.mapped.value.set('' + 25, auctionItem);
      SharedService.user.apiToUse = 'Testing';
    });
    it('Positive match when', () => {
      expect(Filters.isDailySoldMatch(25, 0)).toBeTruthy();
      expect(Filters.isDailySoldMatch(25, 1)).toBeTruthy();
      expect(Filters.isDailySoldMatch(25, undefined)).toBeTruthy();
    });

    it('Negative match when', () => {
      expect(Filters.isDailySoldMatch(25, 50)).toBeFalsy();
      service.mapped.value.get('' + 25).avgDailySold = 0.2;
      expect(Filters.isDailySoldMatch(25, 1)).toBeFalsy();
      expect(Filters.isDailySoldMatch(50, undefined)).toBeFalsy();
    });
  });

  describe('isNameMatch', () => {
    it('Positive matcisSaleRateMatchh when', () => {
      SharedService.items[25] = new Item();
      SharedService.items[25].name = 'Cheese louise';
      expect(Filters.isNameMatch(25, 'Cheese')).toBeTruthy();
      expect(Filters.isNameMatch(25, undefined)).toBeTruthy();
      expect(Filters.isNameMatch(25, null)).toBeTruthy();
    });

    it('Negative match when', () => {
      expect(Filters.isNameMatch(-99, 'Cheese')).toBeFalsy();
    });
  });

  describe('isBelowMarketValue', () => {
    it('Positive when', () => {
      SharedService.user.apiToUse = 'Testing';
      expect(Filters.isBelowMarketValue(152506, 70)).toBeTruthy();
      expect(Filters.isBelowMarketValue(152506, undefined)).toBeTruthy();
      expect(Filters.isBelowMarketValue(152506, null)).toBeTruthy();
      expect(Filters.isBelowMarketValue(152506, 10)).toBeTruthy();
    });

    it('Negative when', () => {
      SharedService.user.apiToUse = 'Testing';
      const fakeItem = new AuctionItem();
      fakeItem.itemID = 1;
      fakeItem.mktPrice = 0;
      service.mapped.value.set('' + fakeItem.itemID, fakeItem);
      expect(Filters.isBelowMarketValue(1, 0.01)).toBeFalsy();
      expect(Filters.isBelowMarketValue(152506, 10)).toBeFalsy();
    });
  });

  describe('isBelowSellToVendorPrice', () => {
    it('Positive when', () => {
      const fakeItem = new AuctionItem();
      fakeItem.itemID = 1;
      fakeItem.buyout = 10;
      fakeItem.bid = 10;
      fakeItem.vendorSell = 30;
      service.mapped.value.set('' + fakeItem.itemID, fakeItem);
      expect(Filters.isBelowSellToVendorPrice(1, true)).toBeTruthy();
      expect(Filters.isBelowSellToVendorPrice(160298, false)).toBeTruthy();
      expect(Filters.isBelowSellToVendorPrice(160298, null)).toBeTruthy();
      expect(Filters.isBelowSellToVendorPrice(160298, undefined)).toBeTruthy();
    });

    it('Negative when', () => {
      expect(Filters.isBelowSellToVendorPrice(152579, true)).toBeFalsy();
      expect(Filters.isBelowSellToVendorPrice(160298, true)).toBeFalsy();
    });
  });

  describe('isAboveItemLevel', () => {
    beforeAll(() => {
      const item: Item = new Item();
      item.itemLevel = 30;
      SharedService.items[25] = item;
    });
    it('Positive when', () => {
      expect(Filters.isAboveItemLevel(25, undefined)).toBeTruthy();
      expect(Filters.isAboveItemLevel(25, null)).toBeTruthy();
      expect(Filters.isAboveItemLevel(25, 30)).toBeTruthy();
      expect(Filters.isAboveItemLevel(25, 20)).toBeTruthy();
    });

    it('Negative when', () => {
      expect(Filters.isAboveItemLevel(1, 100)).toBeFalsy();
      expect(Filters.isAboveItemLevel(25, 31)).toBeFalsy();
    });

  });
});
