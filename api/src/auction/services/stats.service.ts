import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {EventSchema} from '../../models/s3/event-record.model';
import {GzipUtil} from '../../utils/gzip.util';
import {AuctionItemStat, AuctionProcessorUtil} from '../utils/auction-processor.util';
import {NumberUtil} from '../../../../client/src/client/modules/util/utils/number.util';
import {AuctionQuery} from '../auction.query';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

export class StatsService {

  /* istanbul ignore next */
  async getPriceHistoryFor(ahId: number, id: number, petSpeciesId: number = -1, bonusIds?: any[], onlyHourly = true,
                           conn: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    console.log(`getPriceHistoryFor ahId=${ahId} item=${id} pet=${petSpeciesId}`);
    if (onlyHourly) {
      return new Promise((resolve, reject) => {
        this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
          .then(r => {
            resolve(r);
          })
          .catch(error => {
            console.error(error);
            reject({
              status: 500,
              message: error.message
            });
          });
      });
    }
    const result = {
      hourly: [],
      daily: [],
    };
    return new Promise(async (resolve, reject) => {
      try {
        conn.enqueueHandshake()
          .then(() => {
            Promise.all([
              this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
                .then(r => result.hourly = r)
                .catch(console.error),
              this.getPriceHistoryDaily(ahId, id, petSpeciesId, bonusIds, conn)
                .then(r => result.daily = r)
                .catch(console.error)
            ])
              .then(() => {
                AuctionProcessorUtil.setCurrentDayFromHourly(result);
                resolve(result);
              })
              .catch(error => {
                console.error(error);
                reject({
                  status: 500,
                  message: error.message
                });
              });
          })
          .catch(error => {
            console.error(error);
            reject({
              status: 500,
              message: error.message
            });
          });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  private getPriceHistoryHourly(ahId: number, id: number, petSpeciesId: number, bonusIds: number[], conn: DatabaseUtil): Promise<any> {
    return new Promise((resolve, reject) => {
      const fourteenDays = 60 * 60 * 24 * 1000 * 14;
      conn.query(`SELECT *
                FROM itemPriceHistoryPerHour
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}'
                  AND UNIX_TIMESTAMP(date) > ${(+new Date() - fourteenDays) / 1000};`)
        .then((result => {
          resolve(AuctionProcessorUtil.processHourlyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }

  private getPriceHistoryDaily(ahId: number, id: number, petSpeciesId: number, bonusIds: number[], conn: DatabaseUtil): Promise<any[]> {
    return new Promise((resolve, reject) => {
      conn.query(`SELECT *
                FROM itemPriceHistoryPerDay
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}';`)
        .then((result => {
          resolve(AuctionProcessorUtil.processDailyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }

  processRecord(record: EventSchema, conn: DatabaseUtil = new DatabaseUtil()): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const regex = /auctions\/[a-z]{2}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [_, region, ahId, fileName] = splitted;
        new S3Handler().get(record.bucket.name, record.object.key)
          .then(async data => {
            await new GzipUtil().decompress(data['Body'])
              .then(({auctions}) => {
                const lastModified = +fileName.split('-')[0];
                if (!lastModified) {
                  resolve();
                  return;
                }
                const query = AuctionProcessorUtil.process(
                  auctions, lastModified, +ahId);
                const insertStart = +new Date();
                conn.query(query)
                  .then(async ok => {
                    console.log(`Completed item price stat import in ${+new Date() - insertStart} ms`, ok);
                    resolve();
                  })
                  .catch(error => console.error('StatsService.calcFile', error));
                // setTimeout(() => resolve(), 500);
              })
              .catch(reject);
          })
          .catch(reject);
      }
    });
  }

  updateAllRealmDailyData(start: number, end: number, conn = new DatabaseUtil(false)): Promise<any> {
    return new Promise((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 5,
        promiseImplementation: Promise
      });
      const promises = [];
      let processed = 0;
      for (let id = start; id <= end; id++) {// 242
        promises.push(promiseThrottle.add(() =>
          new Promise((ok) => {
            this.compileDailyAuctionData(id, conn)
              .then(() => {
                processed++;
                console.log(`Processed count: ${processed} of ${end - start} - date=${this.getYesterday().toString()}`);
                ok();
              })
              .catch((error) => {
                processed++;
                console.error(`ah=${id} date=${this.getYesterday().toString()}`, error);
                ok();
              });
          })));
      }

      Promise.all(promises)
        .then(() => {
          conn.end();
          resolve();
        })
        .catch(error => {
          conn.end();
          reject();
        });
    });
  }

  compileDailyAuctionData(id: number, conn = new DatabaseUtil(false), date = this.getYesterday()): Promise<any> {
    console.log('Updating daily price data');
    const dayOfMonth = AuctionProcessorUtil.getDateNumber(date.getUTCDate());
    const sql = `SELECT *
                FROM itemPriceHistoryPerHour
                WHERE ahId = ${id} and date = '${date.getUTCFullYear()}-${
      AuctionProcessorUtil.getDateNumber(date.getUTCMonth() + 1)}-${dayOfMonth}'`;
    return new Promise<any>((resolve, reject) => {
      conn.query(sql)
        .then(rows => {
          const list = [];
          rows.forEach(row => {
            AuctionProcessorUtil.compilePricesForDay(id, row, date, dayOfMonth, list);
          });
          if (!list.length) {
            resolve();
            return;
          }

          console.log('Done updating daily price data');
          conn.query(AuctionQuery.multiInsertOrUpdateDailyPrices(list, dayOfMonth))
            .then(resolve)
            .catch(error => {
              console.error('SQL error for id=', id);
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  private getYesterday(): Date {
    return new Date(+new Date() - 1000 * 60 * 60 * 24);
  }

  /*
  * Add a new column to the AH table indicating when the last delete was ran
  * Run once each 6-10 minute
  * Limit 1 order by time since asc (to get the oldest first)
  * */
  deleteOldPriceHistoryForRealmAndSetDailyPrice(conn = new DatabaseUtil(false)): Promise<any> {
    return new Promise((resolve, reject) => {

      const day = 1000 * 60 * 60 * 24;
      const now = new Date();
      if (now.getMinutes() < 30 && now.getMinutes() > 0) {
        resolve();
        return;
      }
      now.setUTCHours(0);
      now.setUTCMinutes(0);
      now.setUTCMilliseconds(0);

      conn.query(`SELECT *
                        FROM auction_houses
                        WHERE lastHistoryDeleteEvent IS NULL OR lastHistoryDeleteEvent < ${+new Date(+now - day)}
                        ORDER BY lastHistoryDeleteEvent
                        LIMIT 1;`)
        .then(async (res) => {
          if (res.length) {
            const {id, lastHistoryDeleteEvent} = res[0];
            const sql = `DELETE FROM itemPriceHistoryPerHour
                        WHERE ahId = ${id} AND UNIX_TIMESTAMP(date) < ${+new Date(+now - day * 15) / 1000};`;
            console.log('Delete query', {sql, lastHistoryDeleteEvent});

            conn.query(sql)
              .then((deleteResult) => {
                deleteResult.affectedRows = NumberUtil.format(deleteResult.affectedRows);
                conn.query(`UPDATE auction_houses
                                SET lastHistoryDeleteEvent = ${+new Date()}
                                WHERE id = ${id};`)
                  .then(() => {
                    console.log('Successfully deleted old price data', deleteResult);
                    conn.end();
                    resolve();
                  })
                  .catch(error => {
                    console.error(error);
                    conn.end();
                    reject(error);
                  });
              })
              .catch(error => {
                console.error(error);
                conn.end();
                reject(error);
              });
          } else {
            conn.end();
            resolve();
          }
        })
        .catch(error => {
          console.error(error);
          conn.end();
          reject(error);
        });
    });
  }
}
