import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../../utils/database.util';
import {EventSchema} from '@models/s3/event-record.model';
import {GzipUtil} from '../../../utils/gzip.util';
import {AuctionProcessorUtil, AuctionStatsUtil, NumberUtil} from '../../../shared/utils';
import {StatsRepository} from '../repository/stats.repository';
import {ListObjectsV2Output} from 'aws-sdk/clients/s3';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {RealmService} from '../../realm/service';
import {DateUtil} from '@ukon1990/js-utilities';
import {
  AhStatsRequest,
  AuctionItemStat,
  ItemDailyPriceEntry,
  ItemPriceCompareEntry,
  ItemPriceEntry,
  ItemStats
} from '../../../shared/models';
import {AuctionHouse} from '../../realm/model';
import {S3} from 'aws-sdk';
import {LogRepository} from '../../logs/repository';
import {RealmLogRepository} from '../../realm/repositories/realm-log.repository';
import {TsmRegionalItemStats} from "@functions/tsm/tsm.model";
import {TsmRepository} from "@functions/tsm/tsm.repository";

const PromiseThrottle: any = require('promise-throttle');

export class StatsService {
  realmRepository: RealmRepository;
  realmLogRepository: RealmLogRepository;

  constructor() {
    this.realmRepository = new RealmRepository();
    this.realmLogRepository = new RealmLogRepository();
  }

  getComparablePricesFor(items: AhStatsRequest[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new StatsRepository().getComparePrices(items)
        .then((res: AuctionItemStat[]) => {
          const ahTypeId = items[0].ahTypeId;
          const map = new Map<number, ItemPriceCompareEntry>();
          const list = [];
          if (!res.length) {
            resolve([]);
            return;
          }
          (AuctionProcessorUtil.processHourlyPriceData(res)[ahTypeId] || []).forEach(row => {
            if (!map.has(row.ahId)) {
              map.set(row.ahId, {
                ahId: row.ahId,
                price: row.min,
                quantity: row.quantity,
                timestamp: row.timestamp,
              });
              list.push(map.get(row.ahId));
            } else {
              const realm = map.get(row.ahId);
              if (realm.timestamp < row.timestamp) {
                realm.price = row.min;
                realm.quantity = row.quantity;
                realm.timestamp = row.timestamp;
              }
            }
          });
          resolve(list);
        })
        .catch(reject);
    });
  }

  /* istanbul ignore next */
  async getPriceHistoryFor(items: AhStatsRequest[], onlyHourly = true,
                           conn: DatabaseUtil = new DatabaseUtil(false, true)): Promise<any> {
    console.log(`getPriceHistoryFor ${
      items.map(({ahId, itemId, petSpeciesId}) => `ahId=${ahId} item=${itemId} pet=${petSpeciesId}`)}`
    );

    if (onlyHourly) {
      return new Promise((resolve, reject) => {
        this.getPriceHistoryHourly(items, conn)
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
              this.getPriceHistoryHourly(items, conn)
                .then(r => result.hourly = r)
                .catch(console.error),
              this.getPriceHistoryDaily(items, conn)
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

  private getPriceHistoryHourly(items: AhStatsRequest[], conn: DatabaseUtil): Promise<any> {
    return new Promise(resolve => {
      new StatsRepository(conn).getPriceHistoryHourly(items)
        .then((result => {
          const ahTypeId = items[0].ahTypeId;
          resolve(AuctionProcessorUtil.processHourlyPriceData(result)[ahTypeId]);
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }

  private getPriceHistoryDaily(items: AhStatsRequest[], conn: DatabaseUtil): Promise<any[]> {
    return new Promise(resolve => {
      new StatsRepository(conn)
        .getPriceHistoryDaily(items)
        .then((result => {
          const ahTypeId = items[0].ahTypeId;
          resolve(AuctionProcessorUtil.processDailyPriceData(result)[ahTypeId]);
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
      /*,
        oldConn = new DatabaseUtil(
          false, false, {
            database: 'wah',
            host: DATABASE_CREDENTIALS.ADMIN.user,
            user: DATABASE_CREDENTIALS.ADMIN.user,
            password: DATABASE_CREDENTIALS.ADMIN.password,
          });
          */

      s3.list('wah-data-eu', 'statistics/inserts/', 180)// default: 50
        .then(async (objects: ListObjectsV2Output) => {
          const files = this.getFilteredAndSortedInsertStatements(objects);
          total = files.length;

          if (total === 0) {
            console.log('Nothing to process');
            resolve();
            return;
          }
          const isTableLocked = await this.getIsTableLocked(conn, 'itemPriceHistoryPerHour');

          if (total > 0 && !isTableLocked) {
            console.log(`Starting processing the next batch of ${total} out  of ${objects.Contents.length} queries.`);
            await new RealmService().updateAllRealmStatuses()
              .catch(console.error);

            Promise.all([
              conn.enqueueHandshake(),
              // oldConn.enqueueHandshake()
            ])
              .then(async () => {
                for (const object of files) {
                  const __ret = await this.insertAndDeleteStatsInsertFile(
                    insertStatsStart, conn, s3, objects, object, completed, avgQueryTime); // oldConn

                  completed = __ret.completed;
                  avgQueryTime = __ret.avgQueryTime;
                }
                console.log(`Completed ${completed} / ${total} (total in queue=${
                  objects.Contents.length
                }) in ${+new Date() - insertStatsStart} ms with an avg of ${avgQueryTime} ms`);
                conn.end();
                // oldConn.end();
                resolve();
              })
              .catch(error => {
                console.error(error);
                conn.end();
                reject(error);
              });
          } else if (isTableLocked) {
            console.log('There is a lock on the table. Items in queue: ', objects.Contents.length);
            conn.end();
            resolve();
          } else {
            console.log('There is no new queries to insert', total);
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

  private async insertAndDeleteStatsInsertFile(
    insertStatsStart: number,
    conn: DatabaseUtil,
    s3: S3Handler,
    objects: S3.ListObjectsV2Output,
    object: S3.Object,
    completed: number,
    avgQueryTime
  ) {
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
                  const [_, ahId] = object.Key.split('/')[3].split('-');
                  await Promise.all([
                    s3.deleteObject(objects.Name, object.Key)
                      .catch(console.error),
                    this.realmRepository.updateEntry(+ahId, {
                      lastStatsInsert: +new Date(),
                    }).catch(dynamoError => {
                      console.error('Error for', {ahId, file: object.Key}, dynamoError);
                    })
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
    return {completed, avgQueryTime};
  }

  private getFilteredAndSortedInsertStatements(objects: S3.ListObjectsV2Output) {
    return objects.Contents
      .sort((a, b) => {
        const getTimestamp = (obj) => {
          const [_, __, timestamp] = obj.Key.split('/')[2].split('-');
          return +timestamp;
        };
        return getTimestamp(b) - getTimestamp(a);
      });
  }

  private async getIsTableLocked(conn: DatabaseUtil, tableName: string) {
    const openTables: { Table: string, In_use: number }[] = await conn.query(LogRepository.showOpenTables)
      .catch(error => console.error(`StatsService.insertStats.getActiveQueries`, error));
    const isLockedRow: { Table: string; In_use: number } = openTables.filter(table => table.Table === 'itemPriceHistoryPerHour')
      .filter(table => table.Table === tableName)[0];
    return isLockedRow ? !!isLockedRow.In_use : false;
  }

  processRecord(record: EventSchema): Promise<void> {
    const start = +new Date();
    return new Promise<void>((resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const regex = /auctions\/[a-z]{1,4}\/[\d]{1,4}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [_, region, ahId, ahTypeId, fileName] = splitted;
        new S3Handler().get(record.bucket.name, record.object.key)
          .then(async data => {
            await new GzipUtil().decompress(data['Body'])
              .then(({auctions}) => {
                const lastModified = +fileName.split('-')[0];
                if (!lastModified || !auctions) {
                  resolve();
                  return;
                }
                const {
                  list,
                  hour
                } = AuctionProcessorUtil.process(auctions, lastModified, +ahId, +ahTypeId);
                const queries = list.filter(subList => subList.length)
                  .map(dataset => StatsRepository.multiInsertOrUpdate(dataset, hour));
                const s3 = new S3Handler();

                Promise.all(
                  queries.map((query, index) =>
                    s3.save(
                      query,
                      `statistics/inserts/hourly/${region}-${ahId}-${ahTypeId}-${fileName}-part-${index}.sql.gz`,
                      {region: 'eu'}
                    ))
                )
                  .then(() => {
                    console.log(`Processed and uploaded statistics SQL in ${+new Date() - start} ms`);
                    resolve();
                  })
                  .catch(error => {
                    reject(error);
                  });
              })
              .catch(reject);
          })
          .catch(reject);
      } else {
        reject();
      }
    });
  }

  updateAllRealmDailyData(start: number, end: number, conn = new DatabaseUtil(false), daysAgo = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 5,
        promiseImplementation: Promise
      });
      const promises = [];
      let processed = 0;
      for (let id = start; id <= end; id++) {// 242
        promises.push(promiseThrottle.add(() =>
          new Promise<void>((ok) => {
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
          reject(error);
        });
    });
  }

  updateNextRealmsDailyPrices(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const conn = new DatabaseUtil(false),
        startTime = +new Date();
      let completed = 0, avgQueryTime;
      conn.enqueueHandshake()
        .then(async () => {
          const openTables: { Table: string, In_use: number }[] = await conn.query(LogRepository.showOpenTables)
            .catch(error => console.error(`StatsService.insertStats.getActiveQueries`, error));
          const isTableLocked: boolean = !!openTables.filter(table => table.Table === 'itemPriceHistoryPerDay')[0].In_use;
          const [status]: { activeQueries: number }[] = await new StatsRepository(conn).getActiveQueries('itemPriceHistoryPerDay')
            .catch(error => console.error(`StatsService.insertStats.getActiveQueries`, error));

          if (isTableLocked || status.activeQueries > 1) {
            console.log('The table is locked or has too many active queries.',
              {locked: isTableLocked, queries: status.activeQueries});
            conn.end();
            resolve();
            return;
          }

          console.log('Preparing to process: ', this.getYesterday());
          this.realmRepository.getRealmsThatNeedsDailyPriceUpdate()
            .then(async realms => {
              for (const {id, region} of realms.slice(0, 4)) {
                if (DateUtil.timeSince(startTime, 's') < 40) {
                  const queryStart = +new Date();
                  await this.compileDailyAuctionData(id, conn, this.getYesterday(1), region)
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

  /**
   * This method is used, in case the database needs to be rebuilt
   * @param daysAgo
   */
  importDailyDataForDate(daysAgo: number = 1): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log('Preparing to process: ', this.getYesterday(daysAgo));
      const conn = new DatabaseUtil(false);
      let completed = 0, avgQueryTime;
      conn.enqueueHandshake()
        .then(() => {
          this.realmRepository.getAll()
            .then(async realms => {
              let hasHadError = false;
              const filteredAndSorted = realms.sort((a, b) => b.id - a.id);
              // .filter(entry => entry.id >= max - 40 && entry.id < max);
              for (const {id, region} of filteredAndSorted) {
                if (!hasHadError) {
                  const queryStart = +new Date();
                  await this.compileDailyAuctionData(id, conn, this.getYesterday(daysAgo), region)
                    .then(() => {
                      completed++;
                      console.log(`Done with ${id} in ${+new Date() - queryStart} ms - ${
                        completed}/${filteredAndSorted.length}`);
                    })
                    .catch(error => {
                      console.error(error);
                      hasHadError = true;
                    });
                  const queryTime = +new Date() - queryStart;
                  if (!avgQueryTime) {
                    avgQueryTime = queryTime;
                  } else {
                    avgQueryTime = (avgQueryTime + queryTime) / 2;
                  }
                }
              }

              console.log(`Done updating daily price for ${completed}/${filteredAndSorted.length
              } houses. Avg query time was ${avgQueryTime}`);
              conn.end();
              resolve(hasHadError);
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

  compileDailyAuctionData(id: number, conn = new DatabaseUtil(false), date = this.getYesterday(), region: string = 'eu'): Promise<void> {
    console.log('Updating daily price data');
    // const s3 = new S3Handler();
    const dayOfMonth = AuctionProcessorUtil.getDateNumber(date.getUTCDate());
    return new Promise<void>((resolve, reject) => {
      new StatsRepository(conn).getHourlyStatsForRealmAtDate(id, date, dayOfMonth)
        .then(rows => {
          const list = [];
          const ahListMap = new Map<number, any[]>();
          const calculationStartTime = +new Date();
          rows.forEach(row => {
            AuctionProcessorUtil.compilePricesForDay(id, row, date, dayOfMonth, list, ahListMap);
          });
          if (!list.length) {
            resolve();
            return;
          }
          console.log(`Calculated stats for ${id} in ${+new Date() - calculationStartTime}ms.`);

          const queryStartTime = +new Date();

          const repo = new StatsRepository(conn);
          const promises = [];
          ahListMap.forEach(ahList => {
            AuctionProcessorUtil.splitEntries(ahList)
              .forEach((entries) => { // index
                const query = repo.multiInsertOrUpdateDailyPrices(entries, dayOfMonth);
                promises.push(conn.query(query));
                /* TODO: Comment back out, if it had no effect on cost
                const first: AuctionItemStat = ahList[0];
                const ahTypeId = first ? first.ahTypeId : '';
                const timestamp = new Date().toJSON().replace(/[:]/gi, '_');
                promises.push(s3.save(
                  query,
                  `statistics/inserts/daily/${region}-${id}-${ahTypeId || '0'}-${timestamp}-part-${index}.sql.gz`,
                  {region: 'eu'}
                ));*/
              });
          });
          Promise.all(promises)
            .then(() => {
              console.log(`Done updating daily price data for ${id} in ${+new Date() - queryStartTime}ms.`);
              resolve();
            })
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

  /**
   TODO: Delete?
   * Add a new column to the AH table indicating when the last delete was ran
   * Run once each 6-10 minute
   * Limit 1 order by time since asc (to get the oldest first)
   * @deprecated
   */
  deleteOldPriceHistoryForRealm(conn = new DatabaseUtil(false)): Promise<void> {
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

  deleteOldPriceForRealm(table: string, olderThan: number, period: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const conn = new DatabaseUtil(false);
      console.log('Starting history deletion for: ', table);

      conn.enqueueHandshake()
        .then(async () => {
          const [status]: { activeQueries: number }[] = await new StatsRepository(conn).getCurrentDeleteQueries(table)
            .catch(error => console.error(`StatsService.deleteOldPriceHistoryForRealm`, error));

          if (status && status.activeQueries > 0) {
            console.log('There is already another active deletion going on.');
            conn.end();
            resolve();
            return;
          }

          new StatsRepository(conn).deleteOldDailyPricesForRealm(table, olderThan, period)
            .then(async (id) => {
              conn.end();
              if (period === 'itemPriceHistoryPerDay') {
                await this.realmLogRepository.deleteOldLogEntriesForId(id)
                  .catch(console.error);
              }
              resolve();
            })
            .catch((err) => {
              conn.end();
              reject(err);
            });
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }

  updateRealmTrends(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const startTime = +new Date();
      const conn = new DatabaseUtil(false);
      const tsmRepository = new TsmRepository(''); // Can't fetch directly for tsm api
      let housesToUpdate: AuctionHouse[];
      await this.realmRepository.getRealmsThatNeedsTrendUpdate()
        .then(houses => housesToUpdate = houses)
        .catch(reject);

      if (!housesToUpdate || !housesToUpdate.length) {
        console.log('There is nothing to update.');
        resolve();
        return;
      }
      conn.enqueueHandshake()
        .then(async () => {
          let completed = 0;

          const regionMap = new Map<string, Map<number, TsmRegionalItemStats>>();
          for (const house of housesToUpdate.slice(0, 10)) {
            if (DateUtil.timeSince(startTime, 's') < 50) {
              const gameVersion = house.gameBuild === 1 ? 'classic' : 'retail';
              const regionId = `${house.region}-${gameVersion}`;
              if (!regionMap.has(regionId)) {
                await tsmRepository.getFromS3(gameVersion, house.region)
                  .then(map => regionMap.set(regionId, map))
                  .catch(console.error);
              }
              await this.setRealmTrends(house, conn, regionMap.get(regionId))
                .then(async () => {
                  completed++;
                  await new RealmService().createLastModifiedFile(house.id, house.region)
                    .catch(err => console.error('Could not createLastModifiedFile', err));
                })
                .catch(console.error);
            }
          }
          console.log(`Done updating for ${completed}/${housesToUpdate.length} in ${DateUtil.timeSince(startTime, 's')} sec`);
          conn.end();
          resolve();
        })
        .catch(err => {
          conn.end();
          reject(err);
        });
    });
  }

  getRealmPriceTrends(
    house: AuctionHouse, tsmMap: Map<number, TsmRegionalItemStats>, db: DatabaseUtil
  ): Promise<{ [key: number]: ItemStats[] }> {
    const start = +new Date();
    const repo = new StatsRepository(db);
    let hourlyData: { [key: number]: ItemPriceEntry[] } = {},
      dailyData: { [key: number]: ItemDailyPriceEntry[] } = [];

    return new Promise((resolve, reject) => {
      Promise.all([
        new Promise<void>((success, fail) => {
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
        new Promise<void>((success, fail) => {
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
          const processedData = this.getProcessedAndCombineHourlyAndDailyTrends(hourlyData, dailyData, tsmMap);
          resolve(processedData);
        })
        .catch(reject);
    });
  }

  /**
   * Combines the hourly and daily data, for each AH per realm.
   * @param hourlyData
   * @param dailyData
   * @param tsmMap
   * @private
   */
  private getProcessedAndCombineHourlyAndDailyTrends(
    hourlyData: { [key: number]: ItemPriceEntry[] },
    dailyData: { [key: number]: ItemDailyPriceEntry[] },
    tsmMap: Map<number, TsmRegionalItemStats>,
  ) {
    const processedData: { [key: number]: ItemStats[] } = {};
    /*
      Looping over each AH found in the hourly data
     */
    Object.keys(hourlyData)
      .forEach(ahTypeId => {
        processedData[ahTypeId] = [];
        const map = new Map<string, ItemStats>();
        this.setDailyAndTSMDataToResult(hourlyData, ahTypeId, map, processedData, tsmMap, dailyData);
        this.setHourlyDataToResult(dailyData, ahTypeId, map, processedData);
      });
    return processedData;
  }

  /**
   * Adding the hourly data per item variation to the list
   * @param dailyData
   * @param ahTypeId
   * @param map
   * @param processedData
   * @private
   */
  private setHourlyDataToResult(
    dailyData: { [p: number]: ItemDailyPriceEntry[] },
    ahTypeId: string, map: Map<string, ItemStats>,
    processedData: { [p: number]: ItemStats[] }
  ) {
    AuctionStatsUtil.processDays(dailyData[ahTypeId]).forEach(item => {
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
        processedData[ahTypeId].push(item);
      } else {
        map.get(id).past7Days = item.past7Days;
      }
    });
  }

  /**
   * Adding the daily and TSM stats data to the result
   * @param hourlyData
   * @param ahTypeId
   * @param map
   * @param processedData
   * @param tsmMap
   * @param dailyData
   * @private
   */
  private setDailyAndTSMDataToResult(
    hourlyData: { [p: number]: ItemPriceEntry[] },
    ahTypeId: string,
    map: Map<string, ItemStats>,
    processedData: { [p: number]: ItemStats[] },
    tsmMap: Map<number, TsmRegionalItemStats>,
    dailyData: { [p: number]: ItemDailyPriceEntry[] }
  ) {
    AuctionStatsUtil.processHours(hourlyData[ahTypeId]).forEach(item => {
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
        processedData[ahTypeId].push(item);
      } else {
        map.get(id).past24Hours = item.past24Hours;
      }

      this.setTsmDataOnItem(tsmMap, item);
    });
    AuctionProcessorUtil.setCurrentDayFromHourly({
      hourly: hourlyData[ahTypeId],
      daily: dailyData[ahTypeId],
    });
  }

  /**
   * Adding the TSM data for the item onto the object
   * @param tsmMap
   * @param item
   * @private
   */
  private setTsmDataOnItem(tsmMap: Map<number, TsmRegionalItemStats>, item: ItemStats) {
    const tsmData = tsmMap.get(item.itemId);
    item.tsm = {
      // TSM API Data
      avgSalePrice: tsmData?.avgSalePrice || 0,
      salePct: tsmData?.salePct ? tsmData?.salePct / 100 : 0,
      soldPerDay: tsmData?.soldPerDay || 0,
      historical: tsmData?.historical || 0,
    };
  }

  setRealmTrends(house: AuctionHouse, db: DatabaseUtil, tsmMap: Map<number, TsmRegionalItemStats>): Promise<void> {
    const start = +new Date();
    console.log('Starting setRealmTrends for', house.region, house.id);
    return new Promise<void>(async (resolve, reject) => {
      await this.realmRepository.updateEntry(house.id, {id: house.id, lastTrendUpdateInitiation: +new Date()})
        .catch(console.error);
      this.getRealmPriceTrends(house, tsmMap, db)
        .then((results) => {
          const processStart = +new Date();
          const hasMultipleAH = Object.keys(results).length > 1;
          const updatedStats = {
            lastModified: +new Date(),
            url: hasMultipleAH ? {} : ''
          };

          Promise.all(
            Object.keys(results)
              .map(ahTypeId => new Promise<void>((success, failed) => {
                if (results[ahTypeId].length) {
                  new S3Handler().save({
                    lastModified: +new Date(),
                    data: results[ahTypeId]
                  }, `stats/${house.id}-${ahTypeId}.json.gz`, {region: house.region})
                    .then(uploadSuccess => {
                      console.log(`Processed and uploaded total ${(+new Date() - start)
                      } ms, Upload=${
                        +new Date() - processStart
                      } ms`, uploadSuccess);
                      if (hasMultipleAH) {
                        updatedStats.url[ahTypeId] = uploadSuccess.url;
                      } else {
                        updatedStats.url = uploadSuccess.url;
                      }
                      success();
                    })
                    .catch(e => {
                      console.error('Failed in ' + (+new Date() - start) + 'ms', e);
                      failed(e);
                    });
                } else {
                  resolve();
                }
              }))
          )
            .then(() => {
              this.realmRepository.updateEntry(house.id, {
                id: house.id,
                stats: updatedStats,
              }, false)
                .then(() => resolve())
                .catch(e => {
                  console.error('setRealmTrends', e);
                  reject(e);
                });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}