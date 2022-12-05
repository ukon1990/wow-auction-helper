import {AuctionService} from './auction.service';
import {DatabaseUtil} from '../../../utils/database.util';
import {environment} from '../../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {EventRecord} from '@models/s3/event-record.model';

const PromiseThrottle: any = require('promise-throttle');

describe('AuctionHandler', () => {
  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  xit('processS3Record', async () => {
    jest.setTimeout(999999);
    await new AuctionService().updateStaticS3Data([{
      s3: {
        bucket: {
          name: 'wah-data-eu'
        },
        object: {
          key: 'auctions/eu/33/0/1622495261000-lastModified.json.gz',
          size: 1395780,
        },
        s3SchemaVersion: '1.0',
        configurationId: '',
      }
    } as EventRecord])
      .then(console.log)
      .catch(console.log);
    console.log('Done');
    expect(1).toBe(2);
  });

  it('Can update all houses', async () => {
    jest.setTimeout(9999999);
    const service = new AuctionService();
    await service.updateAllHouses().catch(console.error);
    expect(true).toBeTruthy();
  });

  xit('Generate daily fields', () => {
    let str = '';
    for (let i = 1; i < 32; i++) {
      const day = i < 10 ? '0' + i : '' + i;
      str += '`minHour' + day + '` SMALLINT(2) NULL,\n';
      str += '`min' + day + '` BIGINT(20) NULL,\n';
      str += '`avg' + day + '` BIGINT(20) NULL,\n';
      str += '`max' + day + '` BIGINT(20) NULL,\n';
      str += '`minQuantity' + day + '` MEDIUMINT NULL,\n';
      str += '`avgQuantity' + day + '` MEDIUMINT NULL,\n';
      str += '`maxQuantity' + day + '` MEDIUMINT NULL,\n';
    }
    console.log(str);
    expect(str).toBeTruthy();
  });

  xit('Map auction house fields', async () => {
    const result = await new AuctionService()
      .generateDataModel('https://eu.api.blizzard.com/data/wow/connected-realm/1403/auctions?namespace=dynamic-eu')
      .catch(console.error);
    console.log('The datamodel is', result);
    expect(result).toBeTruthy();
  });

  xit('Update all daily for date', async () => {
    jest.setTimeout(99999999);
    await new StatsService().updateAllRealmDailyData(
      242, 266, new DatabaseUtil(false), 0) // 0
      .catch(console.error);
    expect(0).toBe(1);
  });
});