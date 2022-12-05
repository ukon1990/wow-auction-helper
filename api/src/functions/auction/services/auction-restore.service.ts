import PromiseThrottle from 'promise-throttle';
import {S3Handler} from '@functions/handlers/s3.handler';
import {DatabaseUtil} from '../../../utils/database.util';
import {RealmRepository} from '@functions/realm/repositories/realm.repository';
import {StatsService} from '@functions/auction/services/stats.service';

export class AuctionRestoreService {
  /**
   * Processes all the auction files and imports them into the hourly price history table
   * @param fromDate
   * @param toDate
   */
  restoreHourly(fromDate: Date, toDate: Date) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 30, // 5
      promiseImplementation: Promise
    });
    const s3 = new S3Handler(),
      conn = new DatabaseUtil(false);
    return new Promise(async (resolve, reject) => {
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
                const filteredFiles = list.Contents.filter(file =>
                    +new Date(file.LastModified) >= +fromDate &&
                    +new Date(file.LastModified) <= +toDate)
                    .sort((a, b) =>
                      +new Date(b.LastModified) - +new Date(a.LastModified));
                console.log(`Getting ready to process ${filteredFiles.length}/${list.Contents.length} files.`);

                totalLength += filteredFiles.length;
                for (const file of filteredFiles) {
                  promises.push(promiseThrottle.add(() =>
                    new Promise<void>((success) => {
                      const splitted = file.Key.split('/');
                      const [_, __, ___, ____, fileName] = splitted;
                      new StatsService().processRecord(
                        {
                          bucket: {name: bucket},
                          object: {key: file.Key, size: 0},
                          s3SchemaVersion: '',
                          configurationId: ''
                        })
                        .then(() => {
                          processed++;
                          try {
                            console.log(`region=${region} ah=${id} date=${file.LastModified}`);
                          } catch (error) {
                            console.error(error, fileName);
                          }
                          console.log(`Processed count: ${processed} of ${totalLength} - ${
                            Math.round((processed / totalLength) * 100)}%`);
                          success();
                        })
                        .catch((error) => {
                          processed++;
                          console.error(`region=${region} ah=${id} date=${file.LastModified}`, error);
                          success();
                        });
                    })));
                }
              })
              .catch(console.error);
          }
        }
      }

      await Promise.all(promises)
        .then(resolve)
        .catch(reject)
        .finally(() => conn.end());
    });
  }

  restoreDaily(date: Date): Promise<void> {
    const conn = new DatabaseUtil(false);
    const realmRepository = new RealmRepository();
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 1,
      promiseImplementation: Promise
    });
    const promises = [];
    let processed = 0;

    return new Promise<void>(async (resolve) => {
      const houses = await realmRepository.getAll();
      for (const {id} of houses) {
        promises.push(promiseThrottle.add(() =>
          new Promise<void>((success) => {
            new StatsService().compileDailyAuctionData(id, conn, new Date(date))
              .then(() => {
                processed++;
                console.log(`Processed count: ${processed} of ${houses.length}`);
                success();
              })
              .catch((error) => {
                processed++;
                console.error(`ah=${id} date=${date}`, error);
                success();
              });
          })));
      }

      await Promise.all(promises)
        .catch(console.error);
      conn.end();
      resolve();
    });
  }
}