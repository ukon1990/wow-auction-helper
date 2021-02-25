import {DatabaseUtil} from '../../utils/database.util';
import {environment} from '../../../../client/src/environments/environment';
import {AuctionItemStatDays} from '../models/auction-item-stat.model';
import {StatsService} from './stats.service';

/**
 * This file is basically used as a script to import data from the local DB to the one in AWS.
 */
export class StatsMigrationToolUtil {
  private localDB: DatabaseUtil;
  private awsDB: DatabaseUtil;

  constructor() {
    this.localDB = new DatabaseUtil(false, {
      database: 'wah',
      host: '127.0.0.1',
      user: 'root',
      password: 'root'
    });
    this.awsDB = new DatabaseUtil(false);
  }

  getAllForRealmAndMonth(ahId: number, year: number, month: number): Promise<AuctionItemStatDays[]> {
    return this.localDB.query(`
      SELECT *
      FROM itemPriceHistoryPerDay
      WHERE ahId = ${ahId} AND date = '${year}-${month}-15' LIMIT 1;
    `);
  }

  cleanAndInsertData(list: AuctionItemStatDays[]): Promise<void> {
    return null;
  }

  migrate(ahId: number, year: number, month: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getAllForRealmAndMonth(ahId, year, month)
        .then(result => {
          this.cleanAndInsertData(result)
            .then(() => resolve())
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

xdescribe('StatsMigrationToolUtil', () => {
  it('Do something', async () => {
    environment.test = false;
    const util = new StatsMigrationToolUtil();
    const res = await util.migrate(69, 2021, 1);

    expect(res).toBeTruthy();
  });
});
