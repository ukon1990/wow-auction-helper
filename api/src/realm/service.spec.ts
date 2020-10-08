import {RealmService} from './service';
import {AuctionUpdateLog} from '../models/auction/auction-update-log.model';
import {environment} from '../../../client/src/environments/environment';

describe('RealmService', () => {
  const service: RealmService = new RealmService();

  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  describe('Not a test', () => {
    xit('Migrate', async () => {
      await service.extractRDSDataToDynamoDB()
        .catch(console.error);
      expect(1).toBe(2);
    });
  });

  describe('getUpdateLog', () => {
    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new RealmService().getUpdateLog(69, 3);
      expect(log.entries.length).toBeLessThanOrEqual(3);
      expect(log.entries.length).toBeGreaterThanOrEqual(2);
      expect(log.minTime).toBeTruthy();
      expect(log.avgTime).toBeTruthy();
      expect(log.maxTime).toBeTruthy();
    });

    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new RealmService().getUpdateLog(69, 2);
      expect(log.entries.length).toBeLessThanOrEqual(2);
      expect(log.entries.length).toBeGreaterThanOrEqual(1);
      expect(log.minTime).toBe(70);
      expect(log.avgTime).toBe(70);
      expect(log.maxTime).toBe(70);
    });
  });
});

