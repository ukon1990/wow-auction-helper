import { SharedService } from '../services/shared.service';
import { AuctionItem } from '../modules/auction/models/auction-item.model';
import { Filters } from './filtering';
import { Item } from './item/item';

fdescribe('Filters', () => {
  beforeEach(() => {
    SharedService.user.apiToUse = 'tsm';
  });

  describe('should be able to check if demand query is matching', () => {
    it('When an auction item is below set value, false shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.08;
      ai.itemID = 25;
      SharedService.auctionItemsMap[ai.itemID] = ai;
      expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeFalsy();
    });

    it('When an auction item is equal set value, true shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.09;
      ai.itemID = 25;
      SharedService.auctionItemsMap[ai.itemID] = ai;
      expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeTruthy();
    });

    it('When an auction item is above set value, true shall be returned', () => {
      const ai = new AuctionItem();
      ai.regionSaleRate = 0.10;
      ai.itemID = 25;
      SharedService.auctionItemsMap[ai.itemID] = ai;
      expect(Filters.isSaleRateMatch(ai.itemID, 9)).toBeTruthy();
    });
  });

  describe('should be able to check if item class query is working', () => {
    it('Should accept all item classes with a -1 or null value', () => {
      const ai = new AuctionItem();
      SharedService.items[25] = new Item();
      SharedService.items[25].itemClass = '1';
      ai.itemID = 25;
      SharedService.auctionItemsMap[ai.itemID] = ai;

      expect(Filters.isItemClassMatch(ai.itemID, null, null)).toBeTruthy();
      expect(Filters.isItemClassMatch(ai.itemID, -1, undefined)).toBeTruthy();
    });

    it('Should be able true if the itemClass is a match', () => {
      const ai = new AuctionItem();
      SharedService.items[25] = new Item();
      SharedService.items[25].itemClass = '0';
      ai.itemID = 25;
      SharedService.auctionItemsMap[ai.itemID] = ai;
      expect(Filters.isItemClassMatch(ai.itemID, 1, undefined)).toBeTruthy();
    });
  });

  describe('should be able to filter for minimum item quality', () => {
    it('Should return true if the quality is above the set value', () => {
      SharedService.items[25] = new Item();
      SharedService.items[25].quality = 3;
      expect(Filters.isItemAboveQuality(25, 1)).toBeTruthy();
    });
  });
});
