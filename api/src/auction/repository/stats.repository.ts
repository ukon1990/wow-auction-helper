import {RealmRepository} from './../../realm/repositories/realm.repository';
import {DatabaseUtil} from '../../utils/database.util';
import {AhStatsRequest, AuctionItemStat} from '@shared/models';
import {AuctionProcessorUtil} from '@shared/utils';
import {RDSQueryUtil} from '../../utils/query.util';
import {AuctionHouse} from '../../realm/model';

export class StatsRepository {
  readonly FOURTEEN_DAYS = 60 * 60 * 24 * 1000 * 14;
  private realmRepository = new RealmRepository();

  static multiInsertOrUpdate(list: AuctionItemStat[], hour: number): string {
    const formattedHour = (hour < 10 ? '0' + hour : '' + hour);

    const insert = new RDSQueryUtil('itemPriceHistoryPerHour')
      .multiInsert(list)
      .replace(';', '');

    return `
      ${insert} ON DUPLICATE KEY UPDATE
        price${formattedHour} = VALUES(price${formattedHour}),
        quantity${formattedHour} = VALUES(quantity${formattedHour});`;
  }

  constructor(private conn: DatabaseUtil = new DatabaseUtil(true, true), autoClose: boolean = true) {
  }

  getAllStatsForRealmDate(house: AuctionHouse): Promise<AuctionItemStat[]> {
    let result = [];

    return new Promise<AuctionItemStat[]>((resolve, reject) => {
      Promise.all(
        AuctionProcessorUtil.getHourlyColumnsSince()
          .map(data => this.conn.query(`
              SELECT date, itemId, ahTypeId, petSpeciesId, bonusIds, ${data.columns.join(', ')}
              FROM itemPriceHistoryPerHour
              WHERE ahId = ${house.id}
                AND date = ${data.date};`)
            .then(res => {
              result = [...result, ...res];
            })
          )
      )
        .then(() => {
          resolve(result);
        })
        .catch(reject);
    });
  }

  getRealmPriceHistoryDailyPastDays(ahId: number, daysSince: number) {
    const {
      columns,
      months
    } = AuctionProcessorUtil.getDailyColumnsSince(daysSince);
    return this.conn.query(`
        SELECT date, itemId, ahTypeId, petSpeciesId, bonusIds, ${columns.join(', ')}
        FROM itemPriceHistoryPerDay
        WHERE ${months.map(month => `(
          ahId = ${ahId}
            AND date = ${month}
          )`).join(' OR ')};
    `);
  }

  getAllStatsForRealmMonth(ahId: number, date: Date = new Date()): Promise<AuctionItemStat[]> {
    return this.conn.query(`
        SELECT *
        FROM itemPriceHistoryPerDay
        WHERE ahId = ${ahId}
          AND date = '${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-15';`);
  }

  getHourlyStatsForRealmAtDate(id: number, date: Date, dayOfMonth: string): Promise<any> {
    return this.conn.query(`SELECT *
                            FROM itemPriceHistoryPerHour
                            WHERE ahId = ${id} and date = '${date.getUTCFullYear()}-${
                                    AuctionProcessorUtil.getDateNumber(date.getUTCMonth() + 1)}-${dayOfMonth}'`);
  }

  multiInsertOrUpdateDailyPrices(list: AuctionItemStat[], day: string): Promise<any> {
    const insert = new RDSQueryUtil('itemPriceHistoryPerDay')
      .multiInsert(list)
      .replace(';', '');
    return this.conn.query(`${insert} ON DUPLICATE KEY UPDATE
      min${day} = VALUES(min${day}),
      minHour${day} = VALUES(minHour${day}),
      avg${day} = VALUES(avg${day}),
      max${day} = VALUES(max${day}),
      minQuantity${day} = VALUES(minQuantity${day}),
      avgQuantity${day} = VALUES(avgQuantity${day}),
      maxQuantity${day} = VALUES(maxQuantity${day});`);
  }

  getPriceHistoryHourly(items: AhStatsRequest[]): any {
    return this.conn.query(`SELECT *
                            FROM itemPriceHistoryPerHour
                            WHERE (
                                      ${
                                              items.map(({
                                                             ahId,
                                                             itemId,
                                                             petSpeciesId = '-1',
                                                             bonusIds,
                                                             ahTypeId = 0
                                                         }) => `
                  (
                    ahId = ${ahId}
                    AND ahTypeId = ${ahTypeId}
                    AND itemId = ${itemId}
                    AND petSpeciesId = ${petSpeciesId}
                    AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}'
                    AND date > NOW() - INTERVAL 15 DAY
                    )
                  `).join(' OR ')}
                                      );`);
  }

  getComparePrices(items: AhStatsRequest[]): Promise<AuctionItemStat[]> {
    const now = new Date();
    const oneHourAgo = new Date(+new Date() - 60 * 60 * 1000);
    const list: AhStatsRequest[] = [];
    items.forEach((row) => {
      list.push({
        ...row,
        date: now,
      });

      if (now.getUTCDate() !== oneHourAgo.getUTCDate()) {
        list.push({
          ...row,
          date: oneHourAgo,
        });
      }
    });
    const sqlFriendlyDateNum = num => num < 10 ? '0' + num : num;
    const thisHour = sqlFriendlyDateNum(now.getUTCHours());
    const previousHour = sqlFriendlyDateNum(oneHourAgo.getUTCHours());
    const sql =
      `SELECT ahId,
              date,
              itemId,
              petSpeciesId,
              bonusIds,
              ahTypeId,
              price${thisHour},
              price${previousHour},
              quantity${thisHour},
              quantity${previousHour}
       FROM itemPriceHistoryPerHour
       WHERE (
                 ${list.map(({ahId, itemId, petSpeciesId = '-1', bonusIds, ahTypeId = 0, date = now}) => `
                  (
                    ahId = ${ahId}
                    AND itemId = ${itemId}
                    AND ahTypeId = ${ahTypeId}
                    AND petSpeciesId = ${petSpeciesId}
                    AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}'
                    )
                  `).join(' OR ')}
                 ) AND date = '${now.getUTCFullYear()}-${sqlFriendlyDateNum(now.getUTCMonth() + 1)}-${now.getUTCDate()}';`;
    return this.conn.query(sql);
  }

  getPriceHistoryDaily(items: AhStatsRequest[]) {
    return this.conn.query(
      `SELECT *
       FROM itemPriceHistoryPerDay
       WHERE (
                 ${items.map(({ahId, itemId, petSpeciesId = '-1', bonusIds, ahTypeId = 0}) => `
                  (
                    ahId = ${ahId}
                    AND itemId = ${itemId}
                    AND ahTypeId = ${ahTypeId}
                    AND petSpeciesId = ${petSpeciesId}
                    AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}'
                    AND date > NOW() - INTERVAL 7 MONTH
                    )
                  `).join(' OR ')}
                 );`);
  }

  getNextHouseInTheDeleteQueue(): Promise<any> {
    return this.conn.query(`SELECT *
                            FROM auction_houses
                            ORDER BY lastHistoryDeleteEvent LIMIT 1;`);
  }

  deleteOldAuctionHouseData(ahId: number, now: Date, day: number): Promise<any> {
    return this.conn.query(`
        DELETE
        FROM itemPriceHistoryPerHour
        WHERE ahId = ${ahId}
          AND UNIX_TIMESTAMP(date) < ${+new Date(+now - day * 15) / 1000} LIMIT 100000;`);
  }

  updateLastDeleteEvent(id: number): Promise<any> {
    return this.conn.query(`
        UPDATE auction_houses
        SET lastHistoryDeleteEvent = ${+new Date()}
        WHERE id = ${id};`);
  }

  getActiveQueries(table = 'itemPriceHistoryPerHour'): Promise<any> {
    return this.conn.query(`
        SELECT count(*) as activeQueries
        FROM information_schema.processlist
        WHERE info NOT LIKE '%information_schema.processlist%'
          AND (info LIKE 'INSERT INTO ${table}%'
            OR info LIKE '%DELETE FROM ${table}%');`);
  }

  getCurrentDeleteQueries(table = 'itemPriceHistoryPerHour'): Promise<any> {
    return this.conn.query(`
        SELECT count(*) as activeQueries
        FROM information_schema.processlist
        WHERE info NOT LIKE '%information_schema.processlist%'
          AND (info LIKE 'SELECT ahId FROM ${table} WHERE date < NOW() - INTERVAL%'
            OR info LIKE '%DELETE FROM ${table}%');`);
  }

  deleteOldDailyPricesForRealm(table: string = 'itemPriceHistoryPerDay', olderThan: number = 7, period: string = 'MONTH'): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      const key = `lastHistoryDeleteEvent${table === 'itemPriceHistoryPerDay' ? 'Daily' : ''}`;
      this.realmRepository.getRealmsThatNeedsStatDeletion(key)
        .then(async ids => {
          if (ids.length) {
            const entry = ids[0];
            const updatedValue = {};
            updatedValue[key] = +new Date();
            entry[key] = updatedValue[key];
            await this.realmRepository.update(entry.id, updatedValue)
              .catch(console.error);

            console.log('Deleting old items for', entry.id, entry.lastHistoryDeleteEvent, entry.lastHistoryDeleteEventDaily);
            this.conn.query(`
                DELETE
                FROM ${table}
                WHERE date < NOW() - INTERVAL ${olderThan} ${period}
                  AND ahId = ${entry.id};`)
              .then(async res => {
                console.log(res);
                resolve(entry.id);
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
          } else {
            resolve(0);
          }
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }
}