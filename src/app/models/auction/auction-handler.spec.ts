
import { async, TestBed } from '@angular/core/testing';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from './auction-item';
import { AuctionHandler } from './auction-handler';
import { User } from '../user/user';

beforeEach(() => {
  User.restore();
  SharedService.user.apiToUse = 'tsm';
  SharedService.tsm[151566] = {
    'Id': 151566, 'Name': 'Fiendish Leather', 'Level': 	101, 'Class': 'Recipe',
    'SubClass': 'Enchanting', 'VendorBuy': 0, 'VendorSell': 1, 'MarketValue': 67384010,
    'MinBuyout': 67187429, 'Quantity': 2, 'NumAuctions': 2, 'HistoricalPrice': 67168841,
    'RegionMarketAvg': 67056881, 'RegionMinBuyoutAvg': 68470724,
    'RegionQuantity': 1, 'RegionHistoricalPrice': 69200725, 'RegionSaleAvg': 21403126,
    'RegionAvgDailySold': 0.02, 'RegionSaleRate': 0.02
  };
  AuctionHandler.organize([
    {
      'auc': 261623576, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623579, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623571, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623562, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623564, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623566, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623552, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261099273, 'item': 32428, 'owner': 'Santadrood', 'ownerRealm': 'Draenor',
      'bid': 8286, 'buyout': 9207, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623555, 'item': 74248, 'owner': 'Hoodin', 'ownerRealm': 'Draenor',
      'bid': 312085, 'buyout': 312085, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }, {
      'auc': 261623557, 'item': 151566, 'owner': 'Dahilla', 'ownerRealm': 'Draenor',
      'bid': 279800, 'buyout': 279800, 'quantity': 1, 'timeLeft': 'VERY_LONG', 'rand': 0,
      'seed': 0, 'context': 0
    }
  ]);
});


describe('Auctions', () => {
  describe('Organizing auctions', () => {
    it('Should be able to organize auctions', () => {
      expect(SharedService.auctionItems[151566].auctions.length).toBeGreaterThan(0);
    });

    it('Should be able to organize auctions', () => {
      const auc = SharedService.auctionItems[151566].auctions;
      expect(auc[0].buyout)
        .toBe(279800);
      expect(auc[auc.length - 1].buyout)
        .toBe(312085);
    });
  });

  describe('API data', () => {
    it('Should set market value, saleAvg, saleRate and avg daily sold', () => {
      const item = SharedService.auctionItems[151566];
      expect(item.mktPrice).toBe(67384010);
      expect(item.avgDailySold).toBe(0.02);
      expect(item.regionSaleAvg).toBe(21403126);
      expect(item.vendorSell).toBe(1);
    });
  });
});
