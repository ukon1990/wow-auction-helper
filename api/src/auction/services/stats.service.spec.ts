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

  it('getComparablePricesFor', async () => {
    const service = new StatsService();
    // const realms = await new RealmRepository().getAll();
    // realms.filter(realm => realm.region === 'eu' && realm.gameBuild !== 1).map(realm => realm.id);
    const ids = [
      115, 117, 47, 122, 79, 69, 110, 62, 113, 104, 44, 39, 10, 82, 3, 65, 38, 96, 123, 81, 120, 21, 14,
      18, 100, 108, 85, 95, 25, 12, 9, 97, 27, 111, 26, 13, 16, 86, 80, 76, 45, 41, 17, 6, 63, 46, 36,
      71, 20, 19, 102, 103, 106, 78, 61, 33, 34, 114, 42, 1, 77, 49, 105, 37, 92, 109, 112, 64, 87, 43,
      5, 22, 107, 68, 29, 24, 83, 23, 30, 116, 28, 67, 11, 91, 84, 94, 57, 60, 48, 74, 70, 99
    ];
    const result = await service.getComparablePricesFor(
      ids.map(id => ({ahId: id, itemId: 178926, petSpeciesId: -1, ahTypeId: 0, bonusIds: [1532, 6758, 7194]})));
    expect(result.length).toBeTruthy();
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
          toStatic = rows[0].filter(item => item.itemId === itemId)[0];
        });
      await new StatsService().getPriceHistoryFor([{
        ahId: 69, itemId,
        bonusIds: undefined,
        petSpeciesId: undefined
      }], false, conn)
        .then(results => {
          toClient = AuctionStatsUtil.processDaysForHourlyPriceData(results.hourly);
          rawDataToClient = AuctionProcessorUtil.processHourlyPriceData(results.hourly)[0];
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

  xdescribe('Maintenance', () => {

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


    xit('Import daily data', async () => {
      jest.setTimeout(999999999);
      const service = new StatsService(); // Dag 7 dager siden
      const hasError = await service.importDailyDataForDate(2);
      expect(hasError).toBe(false);
    });

    it('Delete old history data', async () => {
      jest.setTimeout(999999999);
      const service = new StatsService(); // Dag 7 dager siden
      const realmRepository = new RealmRepository();

      for (let i = 0; i < 300; i++) {
        // await service.deleteOldPriceForRealm('itemPriceHistoryPerHour', 15, 'DAY');
        // await service.deleteOldPriceForRealm('itemPriceHistoryPerDay', 4, 'MONTH');
      }
      const key = `lastHistoryDeleteEvent`;
      const list: AuctionHouse[] = await realmRepository.getRealmsThatNeedsStatDeletion(key);

      expect(list.length).toBe(276);
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
});
