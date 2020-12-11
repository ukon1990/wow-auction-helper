import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {DatabaseUtil} from '../../utils/database.util';
import {StatsRepository} from '../repository/stats.repository';
import {AuctionStatsUtil} from '../utils/auction-stats.util';
import {ItemStats} from '../models/item-stats.model';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';

describe('StatsService', () => {
  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  it('Update trend for realm', async () => {
    jest.setTimeout(99999);
    const conn = new DatabaseUtil(false);
    await conn.enqueueHandshake();
    await new StatsService().setRealmTrends('eu', 69, conn);
    conn.end();
    expect(1).toBe(2);
  });

  describe('Should client value should be the same as static files 24h value', () => {
    jest.setTimeout(999999);
    const itemId = 177715;
    let toStatic: ItemStats;
    let rawDataToStatic = [];
    let toClient: ItemStats;
    let rawDataToClient = [];

    beforeAll(async () => {
      const conn = new DatabaseUtil(false);
      const repo = new StatsRepository(conn);
      await conn.enqueueHandshake();
      await repo.getAllStatsForRealmDate(69)
        .then(rows => {
          toStatic = AuctionStatsUtil.processHours(rows).filter(item => item.itemId === itemId)[0];
          rawDataToStatic = AuctionProcessorUtil.processHourlyPriceData(rows.filter(r => r.itemId === itemId));
        });
      await new StatsService().getPriceHistoryFor(69, itemId, undefined, undefined, true, conn)
        .then(results => {
          toClient = AuctionStatsUtil.processDaysForHourlyPriceData(results);
          rawDataToClient = AuctionProcessorUtil.processHourlyPriceData(results);
        })
        .catch(console.error);
      conn.end();
    });

    it('Both result sets should have the same length', () => {
      rawDataToStatic.forEach(entry => console.log('Date:', ))
      expect(rawDataToStatic.length).toBe(24);
      expect(rawDataToClient.length).toBe(336);
    });
    it('The avg price should be identical', () => {
      expect(toStatic.past24Hours.price.avg)
        .toBe(toClient.past24Hours.price.avg);
    });
    it('The trend price should be identical', () => {
      expect(toStatic.past24Hours.price.trend)
        .toBe(toClient.past24Hours.price.trend);
    });
    it('The avg quantity should be identical', () => {
      expect(toStatic.past24Hours.quantity.avg)
        .toBe(toClient.past24Hours.quantity.avg);
    });
    it('The trend quantity should be identical', () => {
      expect(toStatic.past24Hours.quantity.trend)
        .toBe(toClient.past24Hours.quantity.trend);
    });
  });
});
