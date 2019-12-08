import {AuctionHandler} from './auction.handler';
import {AuctionUpdateLog} from '../models/auction/auction-update-log.model';
import {DateUtil} from '@ukon1990/js-utilities';

describe('AuctionHandler', () => {
  describe('getUpdateLog', () => {
    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new AuctionHandler().getUpdateLog(69, 3);
      expect(log.entries.length).toBeLessThanOrEqual(3);
      expect(log.entries.length).toBeGreaterThanOrEqual(2);
      expect(log.minTime).toBe(70);
      expect(log.avgTime).toBe(70);
      expect(log.maxTime).toBe(70);
    });

    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new AuctionHandler().getUpdateLog(69, 2);
      expect(log.entries.length).toBeLessThanOrEqual(2);
      expect(log.entries.length).toBeGreaterThanOrEqual(1);
      expect(log.minTime).toBe(70);
      expect(log.avgTime).toBe(70);
      expect(log.maxTime).toBe(70);
    });
  });
});
