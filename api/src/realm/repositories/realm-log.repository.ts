import {BaseRepository} from '../../repository/base.repository';
import {DumpDelay} from '../model';
import {AuctionHouseUpdateLog} from '../../shared/models';

export class RealmLogRepository extends BaseRepository<AuctionHouseUpdateLog> {
  private minuteInMS = 1000 * 60;
  private getNDaysSinceInMs = (daysSince = 1) => +new Date() - 1000 * 60 * 60 * 24 * daysSince;


  constructor() {
    super('wah_auction_houses_update_log');
  }

  add(data: any): Promise<any> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<any[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<any> {
    return Promise.resolve(undefined);
  }

  deleteOldLogEntriesForId(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getByIdBefore(id, this.getNDaysSinceInMs(7))
        .then(async result => {
          console.log(`Preparing to delete ${result.length} log entries for ${id}`);
          let count = 0;
          await Promise.all(
            result.map(entry => this.delete(id, 'lastModified', entry.lastModified)
              .then(() => {
                count++;
                console.log(`Successfully deleted ${id} @ ${new Date(entry.lastModified)} (${count} / ${result.length})`);
              })
              .catch(error => {
                console.error(`Could not delete entry ${id} @ ${new Date(entry.lastModified)}`, error);
              }))
          ).catch(console.error);
          resolve();
        })
        .catch(error => {
          console.error('Could not get entries', error);
          reject(error);
        });
    });
  }

  getUpdateDelays(id: number): Promise<DumpDelay> {
    return new Promise<DumpDelay>((resolve, reject) => {
      this.getByIdAfter(id, this.getNDaysSinceInMs(3))
        .then((result) => {

          try {
            result.sort((a, b) =>
              a.lastModified - b.lastModified);

            let min = 60 * this.minuteInMS, max = 60 * this.minuteInMS, avg;

            for (let i = 1; i < result.length; i++) {
              const current = result[i];
              const previous = result[i - 1];
              const diff = current.lastModified - previous.lastModified;

              if (diff > this.minuteInMS) {
                if (!avg) {
                  avg = diff;
                } else {
                  avg = (avg + diff) / 2;
                }

                if (min > diff) {
                  min = diff;
                }

                if (max < diff) {
                  max = diff;
                }
              }
            }
            resolve({
              lowestDelay: Math.round((min / this.minuteInMS) || 60),
              avgDelay: Math.round((avg / this.minuteInMS) || 60),
              highestDelay: Math.round((max / this.minuteInMS) || 60)
            });
          } catch (error) {
            console.error('Failed to calculate delay', error);
            resolve({
              lowestDelay: 60,
              avgDelay: 60,
              highestDelay: 60
            });
          }

        })
        .catch(reject);
    });
  }
}