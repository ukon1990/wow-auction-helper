import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {EventSchema} from '../../models/s3/event-record.model';
import {GzipUtil} from '../../utils/gzip.util';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {NumberUtil} from '../../../../client/src/client/modules/util/utils/number.util';
import {StatsRepository} from '../repository/stats.repository';
import {ListObjectsV2Output, ObjectList} from 'aws-sdk/clients/s3';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {RealmService} from '../../realm/service';
import {AuctionStatsUtil} from '../utils/auction-stats.util';
import {ItemStats} from '../models/item-stats.model';
import {DateUtil} from '@ukon1990/js-utilities';
import {ItemDailyPriceEntry, ItemPriceEntry} from '../../../../client/src/client/modules/item/models/item-price-entry.model';
import {AuctionHouse} from '../../realm/model';
import {S3} from 'aws-sdk';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');


export class StatsService {
  realmRepository: RealmRepository;

  constructor() {
    this.realmRepository = new RealmRepository();
  }


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
      new StatsRepository(conn).getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds)
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
      new StatsRepository(conn)
        .getPriceHistoryDaily(ahId, id, petSpeciesId, bonusIds)
        .then((result => {
          resolve(AuctionProcessorUtil.processDailyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }


  insertStats(): Promise<void> {
    const insertStatsStart = +new Date();
    return new Promise<void>((resolve, reject) => {
      let completed = 0, total = 0, avgQueryTime;
      const s3 = new S3Handler(),
        conn = new DatabaseUtil(false);

      s3.list('wah-data-eu-se', 'statistics/inserts/', 1000)// default: 50
        .then(async (objects: ListObjectsV2Output) => {
          const realmMap = new Map<string, S3.Object>();
          const files = objects.Contents.filter(file => {
            const [_, ahId, timestamp] = file.Key.split('/')[2].split('-');
            const date = new Date(timestamp);
            const id = `${ahId}-${date.getUTCDate()}-${date.getUTCMonth()}-${date.getUTCFullYear()}`;
            if (!realmMap.has(id)) {
              realmMap.set(id, file);
              return true;
            }
            return false;
          }).sort((a, b) => {
            const getTimestamp = (obj) => {
              const [_, __, timestamp] = obj.Key.split('/')[2].split('-');
              return +timestamp;
            };
            return getTimestamp(a) - getTimestamp(b);
          });
          total = files.length;
          if (total > 0) {
            await new RealmService().updateAllRealmStatuses()
              .catch(console.error);

            conn.enqueueHandshake()
              .then(async () => {
                for (const object of files) {
                  if ((+new Date() - insertStatsStart) / 1000 < 50) {
                    const [status]: { activeQueries: number }[] = await new StatsRepository(conn).getActiveQueries()
                      .catch(error => console.error(`StatsService.insertStats.getActiveQueries`, error));

                    if (status.activeQueries < 1) {
                      await s3.getAndDecompress(objects.Name, object.Key)
                        .then(async (query: string) => {
                          if (query) {
                            const insertStart = +new Date();
                            await conn.query(query)
                              .then(async () => {
                                const [region, ahId] = object.Key.split('/')[2].split('-');
                                await Promise.all([
                                  s3.deleteObject(objects.Name, object.Key)
                                    .catch(console.error),
                                  this.realmRepository.updateEntry(+ahId, {
                                    lastStatsInsert: +new Date(),
                                  }).catch(console.error)
                                ])
                                  .catch(console.error);
                                completed++;
                              })
                              .catch(console.error);
                            if (!avgQueryTime) {
                              avgQueryTime = +new Date() - insertStart;
                            } else {
                              avgQueryTime = (avgQueryTime + +new Date() - insertStart) / 2;
                            }
                          }
                        })
                        .catch(error => console.error(`StatsService.insertStats.getAndDecompress`, error));
                    } else {
                      // console.log('There are too many active queries', status.activeQueries);
                    }
                  }
                }
                console.log(`Completed ${completed} / ${total} in ${+new Date() - insertStatsStart} ms with an avg of ${avgQueryTime} ms`);
                conn.end();
                resolve();
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
          } else {
            console.log('There is no new queries to insert', total);
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

  processRecord(record: EventSchema, conn: DatabaseUtil = new DatabaseUtil()): Promise<void> {
    const start = +new Date();
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
                const {
                  list,
                  hour
                } = AuctionProcessorUtil.process(auctions, lastModified, +ahId);
                const query = StatsRepository.multiInsertOrUpdate(list, hour);
                new S3Handler()
                  .save(query, `statistics/inserts/${region}-${ahId}-${fileName}.sql.gz`, {region: 'eu-se'})
                  .then(ok => {
                    console.log(`Processed and uploaded statistics SQL in ${+new Date() - start} ms`);
                    resolve(ok);
                  })
                  .catch(error => {
                    reject(error);
                  });
              })
              .catch(reject);
          })
          .catch(reject);
      }
    });
  }

  updateAllRealmDailyData(start: number, end: number, conn = new DatabaseUtil(false), daysAgo = 1): Promise<any> {
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
            this.compileDailyAuctionData(id, conn, this.getYesterday(daysAgo))
              .then(() => {
                processed++;
                console.log(`Processed count: ${processed} of ${end - start} - date=${this.getYesterday(daysAgo).toString()}`);
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

  updateNextRealmsDailyPrices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const conn = new DatabaseUtil(false),
        startTime = +new Date();
      let completed = 0, avgQueryTime;
      conn.enqueueHandshake()
        .then(() => {
          this.realmRepository.getRealmsThatNeedsDailyPriceUpdate()
            .then(async realms => {
              for (const {id} of realms) {
                if (DateUtil.timeSince(startTime, 's') < 40) {
                  const queryStart = +new Date();
                  await this.compileDailyAuctionData(id, conn, this.getYesterday(1))
                    .then(() => {
                      this.realmRepository.updateEntry(id, {
                        lastDailyPriceUpdate: +new Date(),
                      })
                        .then(() => {
                          completed++;
                        })
                        .catch(console.error);
                    })
                    .catch(console.error);
                  const queryTime = +new Date() - queryStart;
                  if (!avgQueryTime) {
                    avgQueryTime = queryTime;
                  } else {
                    avgQueryTime = (avgQueryTime + queryTime) / 2;
                  }
                }
              }

              console.log(`Done updating daily price for ${completed}/${realms.length
              } houses. Avg query time was ${avgQueryTime}`);
              conn.end();
              resolve();
            })
            .catch(error => {
              conn.end();
              reject(error);
            });
        })
        .catch(error => {
          conn.end();
          reject(error);
        });
    });
  }

  importDailyDataForDate(daysAgo: number = 1): Promise<void>{
    return new Promise<void>((resolve, reject) => {

      const conn = new DatabaseUtil(false),
        startTime = +new Date();
      let completed = 0, avgQueryTime;
      conn.enqueueHandshake()
        .then(() => {
          this.realmRepository.getAll()
            .then(async realms => {
              for (const {id} of realms) {
                  const queryStart = +new Date();
                  await this.compileDailyAuctionData(id, conn, this.getYesterday(daysAgo))
                    .then(() => {
                      completed++;
                    })
                    .catch(console.error);
                  const queryTime = +new Date() - queryStart;
                  if (!avgQueryTime) {
                    avgQueryTime = queryTime;
                  } else {
                    avgQueryTime = (avgQueryTime + queryTime) / 2;
                  }
              }

              console.log(`Done updating daily price for ${completed}/${realms.length
              } houses. Avg query time was ${avgQueryTime}`);
              conn.end();
              resolve();
            })
            .catch(error => {
              conn.end();
              reject(error);
            });
        })
        .catch(error => {
          conn.end();
          reject(error);
        });
    });
  }

  compileDailyAuctionData(id: number, conn = new DatabaseUtil(false), date = this.getYesterday()): Promise<void> {
    console.log('Updating daily price data');
    const dayOfMonth = AuctionProcessorUtil.getDateNumber(date.getUTCDate());
    return new Promise<void>((resolve, reject) => {
      new StatsRepository(conn).insertStats(id, date, dayOfMonth)
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
          new StatsRepository(conn).multiInsertOrUpdateDailyPrices(list, dayOfMonth)
            .then(resolve)
            .catch(error => {
              console.error('SQL error for id=', id);
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  private getYesterday(days = 1): Date {
    return new Date(+new Date() - 1000 * 60 * 60 * 24 * days);
  }

  /*
  * Add a new column to the AH table indicating when the last delete was ran
  * Run once each 6-10 minute
  * Limit 1 order by time since asc (to get the oldest first)
  * */
  deleteOldPriceHistoryForRealm(conn = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const repository = new StatsRepository(conn);
      const [status]: { activeQueries: number }[] = await repository.getActiveQueries()
        .catch(error => console.error(`StatsService.deleteOldPriceHistoryForRealm`, error));

      if (status.activeQueries < 1) {
        const day = 1000 * 60 * 60 * 24;
        const now = new Date();
        /*
        now.setUTCHours(0);
        now.setUTCMinutes(0);

        now.setUTCMilliseconds(0);
        */


        repository.getNextHouseInTheDeleteQueue()
          .then(async (res) => {
            if (res.length) {
              const {id} = res[0];

              repository.deleteOldAuctionHouseData(id, now, day)
                .then((deleteResult) => {
                  deleteResult.affectedRows = NumberUtil.format(deleteResult.affectedRows);
                  repository
                    .updateLastDeleteEvent(id)
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
      } else {
        conn.end();
        console.log('Too many active queries', status.activeQueries);
        resolve();
      }
    });
  }

  deleteOldPriceForRealm(table: string, olderThan: number, period: string, conn = new DatabaseUtil(false)): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      new StatsRepository(conn).deleteOldDailyPricesForRealm(table, olderThan, period)
        .then(() => {
          conn.end();
          resolve();
        })
        .catch((err) => {
          conn.end();
          reject(err);
        });
    });
  }

  updateRealmTrends(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = +new Date();
      const conn = new DatabaseUtil(false);
      conn.enqueueHandshake()
        .then(() => {
          let completed = 0;
          this.realmRepository.getRealmsThatNeedsTrendUpdate()
            .then(async (houses) => {
              for (const house of houses.slice(0, 10)) {
                if (DateUtil.timeSince(startTime, 's') < 50) {
                  await this.setRealmTrends(house, conn)
                    .then(async () => {
                      completed++;
                      await new RealmService().createLastModifiedFile(house.id, house.region)
                        .catch(err => console.error('Could not createLastModifiedFile', err));
                    })
                    .catch(console.error);
                }
              }
              console.log(`Done updating for ${completed}/${houses.length} in ${DateUtil.timeSince(startTime, 's')} sec`);
              conn.end();
              resolve();
            })
            .catch(err => {
              conn.end();
              console.error(err);
              reject(err);
            });
        })
        .catch(err => {
          conn.end();
          reject(err);
        });
    });
  }

  getRealmPriceTrends(house: AuctionHouse, db: DatabaseUtil): Promise<any> {
    const start = +new Date();
    const repo = new StatsRepository(db);
    const results: ItemStats[] = [],
      map = new Map<string, ItemStats>();
    let hourlyData: ItemPriceEntry[] = [],
      dailyData: ItemDailyPriceEntry[] = [];

    return new Promise((resolve, reject) => {
      Promise.all([
        new Promise((success, fail) => {
          repo.getRealmPriceHistoryDailyPastDays(house.id, 8)
            .then(rows => {
              const downloadAndQueryTime = +new Date() - start;
              dailyData = AuctionProcessorUtil.processDailyPriceData(rows);

              console.log(`Daily query took ${downloadAndQueryTime} ms, processing took = ${+new Date() - start} ms len=${rows.length}`);
              success();
            })
            .catch(error => {
              console.error(error);
              fail(error);
            });
        }),
        new Promise((success, fail) => {
          repo.getAllStatsForRealmDate(house)
            .then(rows => {
              hourlyData = AuctionProcessorUtil.processHourlyPriceData(rows);
              // AuctionStatsUtil.processHours(rows);
              success();
            })
            .catch(error => {
              console.error(error);
              fail(error);
            });
        })
      ])
        .then(() => {
          AuctionStatsUtil.processHours(hourlyData).forEach(item => {
            const id = AuctionStatsUtil.getId(item.itemId, item.bonusIds, item.petSpeciesId);
            if (!map.has(id)) {
              item.past7Days = {
                price: {
                  trend: item.past24Hours.price.trend * 24,
                  avg: item.past24Hours.price.avg * 24
                },
                quantity: {
                  trend: item.past24Hours.quantity.trend * 24,
                  avg: item.past24Hours.quantity.avg * 24
                },
                totalEntries: item.past24Hours.totalEntries,
              };
              map.set(id, item);
              results.push(item);
            } else {
              map.get(id).past24Hours = item.past24Hours;
            }
          });

          AuctionProcessorUtil.setCurrentDayFromHourly({
            hourly: hourlyData,
            daily: dailyData,
          });
          AuctionStatsUtil.processDays(dailyData).forEach(item => {
            const id = AuctionStatsUtil.getId(item.itemId, item.bonusIds, item.petSpeciesId);
            if (!map.has(id)) {
              item.past24Hours = {
                price: {
                  trend: 0,
                  avg: 0
                },
                quantity: {
                  trend: 0,
                  avg: 0
                },
                totalEntries: 0,
              };
              map.set(id, item);
              results.push(item);
            } else {
              map.get(id).past7Days = item.past7Days;
            }
          });
          resolve(results);
        })
        .catch(reject);
    });
  }

  setRealmTrends(house: AuctionHouse, db: DatabaseUtil): Promise<void> {
    const start = +new Date();
    console.log('Starting setRealmTrends for', house.region, house.id);
    return new Promise<void>(async (resolve, reject) => {
      await this.realmRepository.updateEntry(house.id, {id: house.id, lastTrendUpdateInitiation: +new Date()})
        .catch(console.error);
    this.getRealmPriceTrends(house, db)
        .then((results) => {
          const processStart = +new Date();
          if (results.length) {
            const lastModified = +new Date();
            new S3Handler().save({
              lastModified: +new Date(),
              data: results
            }, `stats/${house.id}.json.gz`, {region: house.region})
              .then(success => {
                console.log(`Processed and uploaded total ${(+new Date() - start)
                } ms, Upload=${
                  +new Date() - processStart
                } ms`, success);
                this.realmRepository.updateEntry(house.id, {
                  id: house.id, stats: {
                    lastModified,
                    url: success.url
                  }
                }, false)
                  .then(() => resolve(success))
                  .catch(e => {
                    console.error('setRealmTrends', e);
                    reject(e);
                  });
              })
              .catch(e => {
                console.error('Failed in ' + (+new Date() - start) + 'ms', e);
                reject(e);
              });
          } else {
            resolve();
          }
        })
        .catch(reject);
    });
  }
}
