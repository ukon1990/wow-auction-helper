import {DatabaseUtil} from '../../utils/database.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {RDSQueryUtil} from '../../utils/query.util';

export class StatsRepository {
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

  constructor(private conn: DatabaseUtil, autoClose: boolean = true) {
  }

  getAllStatsForRealmDate(ahId: number): Promise<AuctionItemStat[]> {
    return this.conn.query(`
        SELECT *
        FROM itemPriceHistoryPerHour
        WHERE ahId = ${ahId}
          AND date >= NOW() - INTERVAL 7 DAY
        ORDER BY date;`);
  }

  getAllStatsForRealmMonth(ahId: number, date: Date = new Date()): Promise<AuctionItemStat[]> {
    return this.conn.query(`
        SELECT *
        FROM itemPriceHistoryPerDay
        WHERE ahId = ${ahId}
          AND date = '${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-15';`);
  }

  insertStats(id: number, date: Date, dayOfMonth: string): Promise<any> {
    return this.conn.query(`SELECT *
                FROM itemPriceHistoryPerHour
                WHERE ahId = ${id} and date = '${date.getUTCFullYear()}-${
      AuctionProcessorUtil.getDateNumber(date.getUTCMonth() + 1)}-${dayOfMonth}'`);
  }

  multiInsertOrUpdateDailyPrices(list: AuctionItemStat[], day: string): Promise<any> {
    const insert = new RDSQueryUtil('itemPriceHistoryPerDay')
      .multiInsert(list)
      .replace(';', '');
    console.log('multiInsertOrUpdateDailyPrices', list[0]);
    return this.conn.query(`${insert} ON DUPLICATE KEY UPDATE
      min${day} = VALUES(min${day}),
      minHour${day} = VALUES(minHour${day}),
      avg${day} = VALUES(avg${day}),
      max${day} = VALUES(max${day}),
      minQuantity${day} = VALUES(minQuantity${day}),
      avgQuantity${day} = VALUES(avgQuantity${day}),
      maxQuantity${day} = VALUES(maxQuantity${day});`);
  }

  getPriceHistoryHourly(ahId: number, id: number, petSpeciesId: number, bonusIds: number[]) {
    const fourteenDays = 60 * 60 * 24 * 1000 * 14;
    return this.conn.query(`SELECT *
                FROM itemPriceHistoryPerHour
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}'
                  AND UNIX_TIMESTAMP(date) > ${(+new Date() - fourteenDays) / 1000};`);
  }

  getPriceHistoryDaily(ahId: number, id: number, petSpeciesId: number, bonusIds: number[]) {
    return this.conn.query(`SELECT *
                FROM itemPriceHistoryPerDay
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = '${AuctionItemStat.bonusIdRaw(bonusIds)}';`);
  }

  getNextHouseInTheDeleteQueue(): Promise<any> {
    return this.conn.query(`SELECT *
                            FROM auction_houses
                            ORDER BY lastHistoryDeleteEvent
                            LIMIT 1;`);
  }

  deleteOldAuctionHouseData(ahId: number, now: Date, day: number): Promise<any> {
    return this.conn.query(`
            DELETE FROM itemPriceHistoryPerHour
            WHERE ahId = ${ahId} AND UNIX_TIMESTAMP(date) < ${+new Date(+now - day * 15) / 1000}
            LIMIT 100000;`);
  }

  updateLastDeleteEvent(id: number): Promise<any> {
    return this.conn.query(`
        UPDATE auction_houses
        SET lastHistoryDeleteEvent = ${+new Date()}
        WHERE id = ${id};`);
  }

  getActiveQueries(): Promise<any> {
    return this.conn.query(`
      SELECT count(*) as activeQueries
      FROM information_schema.processlist
      WHERE info NOT LIKE '%information_schema.processlist%' AND
          (info LIKE 'INSERT INTO itemPriceHistoryPerHour%'
              OR info LIKE '%DELETE FROM%');`);
  }

  deleteOldDailyPricesForRealm(table: string = 'itemPriceHistoryPerDay', olderThan: number = 7, period: string = 'MONTH') {
    return new Promise<void>(async (resolve, reject) => {
      this.conn.query(`
          SELECT ahId
          FROM ${table}
          WHERE date < NOW() - INTERVAL ${olderThan} ${period}
          GROUP BY ahId
          ORDER BY ahId
          LIMIT 1
      `)
        .then(ids => {
          if (ids.length) {
            this.conn.query(`
          DELETE
          FROM ${table}
          WHERE date < NOW() - INTERVAL ${olderThan} ${period}
            AND ahId = ${ids[0].ahId};`)
              .then(res => {
                console.log(res);
                resolve();
              })
              .catch(error => {
                console.error(error);
                reject(error);
              });
          } else {
            resolve();
          }
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  }
}
