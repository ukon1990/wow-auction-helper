import {AuctionService} from './auction.service';
import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {EventRecord} from '../../models/s3/event-record.model';

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

  xit('Testing the behavior of shit', async () => {
    jest.setTimeout(100000);
    await new AuctionService().getAndUploadAuctionDump({
      lastModified: 1584374830000, url: 'https://eu.api.blizzard.com/data/wow/connected-realm/1329/auctions?namespace=dynamic-eu'
    }, 113, 'eu');
    await new AuctionService().getAndUploadAuctionDump({
      lastModified: 1584374834000, url: 'https://eu.api.blizzard.com/data/wow/connected-realm/3391/auctions?namespace=dynamic-eu'
    }, 115, 'eu');
    expect(1).toBe(1);
  });

  it('Can update all houses', async () => {
    jest.setTimeout(9999999);
    const service = new AuctionService();
    await service.updateAllHouses().catch(console.error);
    expect(true).toBeTruthy();
  });

  xit('can add daily data from hourly', async () => {
    jest.setTimeout(1000000000);
    const conn = new DatabaseUtil(false);
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 1,
      promiseImplementation: Promise
    });
    const promises = [];
    let processed = 0;
    const date = '2020-02-05'; // 02-04
    for (let id = 1; id <= 260; id++) {// 242
      promises.push(promiseThrottle.add(() =>
        new Promise((resolve) => {
          new StatsService().compileDailyAuctionData(id, conn, new Date(date))
            .then(() => {
              processed++;
              console.log(`Processed count: ${processed} of ${260}`);
              resolve();
            })
            .catch((error) => {
              processed++;
              console.error(`ah=${id} date=${date}`, error);
              resolve();
            });
        })));
    }

    await Promise.all(promises)
      .catch(console.error);
    conn.end();
    expect(1).toBeTruthy();
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

  it('Adding stuff to db', async () => {
    jest.setTimeout(1000000000);
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 30, // 5
      promiseImplementation: Promise
    });
    const s3 = new S3Handler(),
      conn = new DatabaseUtil(false);
    const promises = [];
    let totalLength = 0;
    let processed = 0;
    const repo = new RealmRepository();
    const  realms = await repo.getAll();
    console.log('Realms', realms.length);
    const regions = [{id: 'eu', list: ['eu']}, {id: 'us', list: ['us']}, {id: 'as', list: ['kr', 'tw']}];
    for (const s3Region of regions) {
    // const s3Region = regions[0];
      for (const region of s3Region.list) {
        console.log('Starting with region: ', region, realms.filter(realm => realm.region === region).length);
        const idsForRealm = realms.filter(realm => realm.region === region).map(realm => realm.id);

        for (const id of idsForRealm) {
          const bucket = 'wah-data-' + s3Region.id;
          await s3.list(bucket, `auctions/${region}/${id}/`, 999999)
            .then(list => {
              const day = 9; // Startet på 21-22
              const startDay = +new Date(`1/${day}/2021`),
                endDay = +new Date(`1/${day + 3}/2021`), // max: 1/22/2021
                filteredFiles = list.Contents.filter(file =>
                  +new Date(file.LastModified) >= startDay &&
                  +new Date(file.LastModified) <= endDay)
                  .sort((a, b) =>
                    +new Date(b.LastModified) - +new Date(a.LastModified));
              console.log(`Getting ready to process ${filteredFiles.length}/${list.Contents.length} files.`);

              totalLength += filteredFiles.length;
              for (const file of filteredFiles) {
                promises.push(promiseThrottle.add(() =>
                  new Promise((resolve) => {
                    const splitted = file.Key.split('/');
                    const [auctions, region1, ahId, fileName] = splitted;
                    const date = new Date(+fileName
                      .replace('-lastModified', '')
                      .replace('.json.gz', '').toString());
                    new StatsService().processRecord(
                      {
                        bucket: {name: bucket},
                        object: {key: file.Key, size: 0},
                        s3SchemaVersion: '',
                        configurationId: ''
                      })
                      .then(() => {
                        processed++;
                        console.log(`region=${region} ah=${id} date=${date}`);
                        console.log(`Processed count: ${processed} of ${totalLength}`);
                        resolve();
                      })
                      .catch((error) => {
                        processed++;
                        console.error(`region=${region} ah=${id} date=${date}`, error);
                        resolve();
                      });
                  })));
              }
            })
            .catch(console.error);
        }
      }
    }

    await Promise.all(promises)
      .catch(console.error);
    conn.end();
    expect(1).toBe(1);
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
