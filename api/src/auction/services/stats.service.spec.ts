import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {DatabaseUtil} from '../../utils/database.util';
import {AuctionStatsUtil} from '../utils/auction-stats.util';
import {ItemStats} from '../models/item-stats.model';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {AuctionHouse} from '../../realm/model';
import {S3Handler} from '../../handlers/s3.handler';
import {RealmRepository} from '../../realm/repositories/realm.repository';

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
      await new StatsService().getPriceHistoryFor([{
        ahId: 69, itemId,
        bonusIds: undefined,
        petSpeciesId: undefined
      }], false, conn)
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

  xit('Import daily data', async () => {
    jest.setTimeout(999999999);
    const service = new StatsService(); // Dag 7 dager siden
    const hasError = await service.importDailyDataForDate(9);
    expect(hasError).toBe(false);
  });

  it('Delete old history data', async () => {
    jest.setTimeout(999999999);
    const service = new StatsService(); // Dag 7 dager siden
    const realmRepository = new RealmRepository();
    // const hasError = await service.deleteOldPriceForRealm('itemPriceHistoryPerDay', 4, 'MONTH');
    const key = `lastHistoryDeleteEvent`;
    const list: AuctionHouse[] = await realmRepository.getRealmsThatNeedsStatDeletion(key);

    expect(list.length).toBe(0);
  });

  xit('Test', async () => {
    jest.setTimeout(999999);
    const list = await new S3Handler()
      .list('wah-data-eu-se', 'statistics/inserts/', 9999999);
    const queue = {};
    list.Contents.forEach(entry => {

      const [region, ahId, timestamp] = entry.Key.split('/')[2].split('-');
      const date = new Date(+timestamp);
      const dateId = `${date.getUTCDate()}-${date.getUTCMonth()}-${date.getUTCFullYear()}`;
      if (!queue[dateId]) {
        queue[dateId] = 0;
      }
      queue[dateId]++;
    });
    console.log('Queue: ', queue);
    expect(list.Contents.length).toBe(100);
  });
});
