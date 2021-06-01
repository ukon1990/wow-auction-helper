import {BaseRepository} from '../../repository/base.repository';
import {AuctionHouseUpdateLog, DumpDelay} from '../model';

export class RealmLogRepository extends BaseRepository<AuctionHouseUpdateLog> {
  private minuteInMS = 1000 * 60;

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

  getUpdateDelays(id: number): Promise<DumpDelay> {
    return new Promise<DumpDelay>((resolve, reject) => {
      const threeDaysAgo = +new Date() - 1000 * 60 * 60 * 72;
      this.getByIdAfter(id, threeDaysAgo)
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
