import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {DatabaseUtil} from '../../utils/database.util';
import {AuctionStatsUtil} from '../utils/auction-stats.util';
import {ItemStats} from '../models/item-stats.model';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {AuctionHouse} from '../../realm/model';

describe('StatsService', () => {
  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  it('Update trend for realm', async () => {
    jest.setTimeout(99999);
    const conn = new DatabaseUtil(false);
    await conn.enqueueHandshake();
    await new StatsService().setRealmTrends({
      id: 69,
      region: 'eu'
    } as AuctionHouse, conn);
    conn.end();
    expect(1).toBe(2);
  });

  describe('Should client value should be the same as static files 24h value', () => {
    jest.setTimeout(999999);
    const itemId = 177715;
    let toStatic: ItemStats;
    let toClient: ItemStats;
    let rawDataToClient = [];

    beforeAll(async () => {
      const conn = new DatabaseUtil(false);
      await conn.enqueueHandshake();
      await new StatsService().getRealmPriceTrends({
        id: 69,
        region: 'eu'
      } as AuctionHouse, conn)
        .then(rows => {
          toStatic = rows.filter(item => item.itemId === itemId)[0];
        });
      await new StatsService().getPriceHistoryFor(69, itemId, undefined, undefined, false, conn)
        .then(results => {
          toClient = AuctionStatsUtil.processDaysForHourlyPriceData(results.hourly);
          rawDataToClient = AuctionProcessorUtil.processHourlyPriceData(results.hourly);
        })
        .catch(console.error);
      conn.end();
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
