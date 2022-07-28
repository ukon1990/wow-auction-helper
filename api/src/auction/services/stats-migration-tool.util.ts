import {DatabaseUtil} from '../../utils/database.util';
import {AuctionItemStat, AuctionItemStatDays} from '../../shared/models';
import {AuctionProcessorUtil} from '../../shared/utils';
import {RDSQueryUtil} from '../../utils/query.util';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {DATABASE_CREDENTIALS} from '../../secrets';

/**
 * This file is basically used as a script to import data from the local DB to the one in AWS.
 */
export class StatsMigrationToolUtil {
  private source: DatabaseUtil;
  private target: DatabaseUtil;
  private util: RDSQueryUtil<unknown>;
  private readonly table: string;

  constructor() {
    this.table = 'itemPriceHistoryPerHour';
    this.target = new DatabaseUtil(false);
    this.source = new DatabaseUtil(false, false, {
      database: 'wah',
      host: DATABASE_CREDENTIALS.OLD.host,
      user: DATABASE_CREDENTIALS.ADMIN.user,
      password: DATABASE_CREDENTIALS.ADMIN.password
    });
    this.util = new RDSQueryUtil(this.table);
  }
  numberToString(value: number): string {
    return `${value < 10 ? '0' + value : value}`;
  }

  getDate(year: number, month: number, day: number): string {
    return `${year}-${this.numberToString(month)}-${this.numberToString(day)}`;
  }

  end() {
    this.target.end();
    this.source.end();
  }

  private getAllForRealmAndDate(ahId: number, year: number, month: number, day: number): Promise<AuctionItemStat[]> {
    const query = `
      SELECT *
      FROM ${this.table}
      WHERE ahId = ${ahId} AND date = '${this.getDate(year, month, day)}';
    `;
    return this.source.query(query);
  }

  private getAllForRealmAndMonth(ahId: number, year: number, month: number): Promise<AuctionItemStatDays[]> {
    /*
    Used for getting a partial period
    const columns = AuctionProcessorUtil.getDailyColumnsSince(
      14, new Date('01/16/2021'), true).columns.join(', ');

    date, ahId, itemId, petSpeciesId, bonusIds, ${columns}
    */
    return this.source.query(`
      SELECT *
      FROM ${this.table}
      WHERE ahId = ${ahId} AND date = '${year}-${month}-15';;
    `);
  }

  private cleanAndInsertData(list: any[], year: number, month: number, day: number = 15): Promise<void> {
    const splitList = AuctionProcessorUtil.splitEntries(list.map(original => ({
      ...original,
      date: this.getDate(year, month, day)
    })));
    return new Promise<void>((resolve, reject) => {
      Promise.all(
        splitList.map(rows =>
          this.target.query(this.util.multiInsertOrUpdate(rows, false))))
        .then((ok) => {
          resolve();
        })
        .catch(reject);
    });
  }

  migrate(ahId: number, year: number, month: number, day: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.source.enqueueHandshake(),
        this.target.enqueueHandshake()
      ])
        .then(() => {
          this.getAllForRealmAndDate(ahId, year, month, day)
          // this.getAllForRealmAndMonth(ahId, year, month)
            .then(result => {
              this.cleanAndInsertData(result, year, month, day)
                .then(() => resolve())
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  async performMigrationForAllRealms() {
    const realmRepo = new RealmRepository();
    const ahs = await realmRepo.getAll();
    let completed = 0;
    const list = ahs.filter(a => a.id > 21).sort((a, b) => a.id - b.id);
    for (const ah of list) {
      for (let day = 1; day < 31; day++) {
        await this.migrate(ah.id, 2022, 7, day);
      }
      completed++;
      console.log(`Processing id=${ah.id} -  ${completed} of ${list.length} (${Math.round(completed / list.length * 100)}%)`);
    }
    this.end();
  }
}