import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {DatabaseUtil} from '../../utils/database.util';
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
    let toClient: ItemStats;
    let rawDataToClient = [];

    beforeAll(async () => {
      const conn = new DatabaseUtil(false);
      await conn.enqueueHandshake();
      await new StatsService().getRealmPriceTrends(69, conn)
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

  describe('getStartOfTodayForTimeZone', () => {
    const exampleDate = new Date('2020-12-24T15:30:00.000Z');

    const getLocalTime = (date: Date, timezone: string): string => Intl.DateTimeFormat([], {
      hour: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: timezone
    }).format(date);

    it('America/Los_Angeles', () => {
      const tz = 'America/Los_Angeles';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-24T08:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });

    it('America/Denver', () => {
      const tz = 'America/Denver';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-24T07:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });

    it('America/Chicago', () => {
      const tz = 'America/Chicago';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-24T06:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });

    it('America/New_York', () => {
      const tz = 'America/New_York';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-24T05:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });

    it('America/Sao_Paulo', () => {
      const tz = 'America/Sao_Paulo';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-24T03:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });

    it('Europe/Paris', () => {
      const tz = 'Europe/Paris';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-23T23:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });
    it('Asia/Taipei', () => {
      const tz = 'Asia/Taipei';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-23T16:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });
    it('Asia/Seoul', () => {
      const tz = 'Asia/Seoul';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-23T15:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });
    it('Australia/Melbourne', () => {
      const tz = 'Australia/Melbourne';
      const res: Date = new StatsService().getStartOfTodayForTimeZone(tz, exampleDate);
      expect(res).toEqual(new Date('2020-12-23T13:00:00.000Z'));
      expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
    });
  });
});
