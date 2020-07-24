import {SharedService} from '../../../services/shared.service';
import {AuctionUtil} from './auction.util';
import {MockLoaderUtil} from '../../../mocks/mock-loader.util';

beforeEach(() => {
  new MockLoaderUtil().initBaseData();
});

/*
describe('AuctionUtil', () => {
  describe('Organizing auctions', () => {
    it('Should be able to organize auctions', () => {
      expect(SharedService.auctionItemsMap[99999999999].auctions.length).toBeGreaterThan(0);
    });

    it('Should be able to organize auctions', () => {
      const auc = SharedService.auctionItemsMap[99999999999].auctions;
      expect(auc[0].buyout)
        .toBe(279800);
      expect(auc[auc.length - 1].buyout)
        .toBe(312085);
    });
  });

  describe('API data', () => {
    it('Should set market value, saleAvg, saleRate and avg daily sold', () => {
      const item = SharedService.auctionItemsMap[99999999999];
      expect(item.mktPrice).toBe(67384010);
      expect(item.avgDailySold).toBe(0.02);
      expect(item.regionSaleAvg).toBe(21403126);
      expect(item.vendorSell).toBe(1);
    });
  });
});
*/

