import {DatabaseUtil} from '../../utils/database.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {QueryUtil} from '../../utils/query.util';

export class StatsRepository {
  static multiInsertOrUpdate(list: AuctionItemStat[], hour: number): string {
    const formattedHour = (hour < 10 ? '0' + hour : '' + hour);

    const insert = new QueryUtil('itemPriceHistoryPerHour')
      .multiInsert(list)
      .replace(';', '');

    return `
      ${insert} ON DUPLICATE KEY UPDATE
        price${formattedHour} = VALUES(price${formattedHour}),
        quantity${formattedHour} = VALUES(quantity${formattedHour});`;
  }

  constructor(private conn: DatabaseUtil, autoClose: boolean = true) {
  }

  getAllStatsForRealmDate(ahId: number, date: Date = new Date()): Promise<AuctionItemStat[]> {
    return this.conn.query(`
        SELECT *
        FROM itemPriceHistoryPerHour
        WHERE ahId = ${ahId}
          AND date = '${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}';`);
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
    const insert = new QueryUtil('itemPriceHistoryPerDay')
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

  getNextHouseInTheDeleteQueue(now: Date, day: number): Promise<any> {
    return this.conn.query(`SELECT *
                        FROM auction_houses
                        WHERE lastHistoryDeleteEvent IS NULL OR lastHistoryDeleteEvent < ${+new Date(+now - day)}
                        ORDER BY lastHistoryDeleteEvent
                        LIMIT 1;`);
  }

  deleteOldAuctionHouseData(id: any, now: Date, day: number): Promise<any> {
    return this.conn.query(`
            DELETE FROM itemPriceHistoryPerHour
            WHERE ahId = ${id} AND
                  UNIX_TIMESTAMP(date) < ${+new Date(+now - day * 15) / 1000};`);
  }

  updateLastDeleteEvent(id: number): Promise<any> {
    return this.conn.query(`
        UPDATE auction_houses
        SET lastHistoryDeleteEvent = ${+new Date()}
        WHERE id = ${id};`);
  }
}
