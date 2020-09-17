import {DatabaseUtil} from '../../utils/database.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';

export class StatsRepository {

  constructor(private conn: DatabaseUtil, autoClose: boolean = true) {
  }

  getAllStatsForRealmDate(ahId: number, date: Date = new Date()): Promise<AuctionItemStat[]> {
    return this.conn.query(`
        SELECT ahId,
               itemId,
               date,
               petSpeciesId,
               bonusIds,
               price00,
               price01,
               price02,
               price03,
               price04,
               price05,
               price06,
               price07,
               price08,
               price09,
               price10,
               price11,
               price12,
               price13,
               price14,
               price15,
               price16,
               price17,
               price18,
               price19,
               price20,
               price21,
               price22,
               price23
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
}
