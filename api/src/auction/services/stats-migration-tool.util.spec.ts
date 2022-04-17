import {DatabaseUtil} from '../../utils/database.util';
import {environment} from '../../../../client/src/environments/environment';
import {AuctionItemStatDays} from '@shared/models';
import {AuctionProcessorUtil} from '@shared/utils';
import {RDSQueryUtil} from '../../utils/query.util';
import {RealmRepository} from '../../realm/repositories/realm.repository';

/**
 * This file is basically used as a script to import data from the local DB to the one in AWS.
 */
export class StatsMigrationToolUtil {
  private localDB: DatabaseUtil;
  private awsDB: DatabaseUtil;
  private util: RDSQueryUtil<unknown>;

  constructor() {
    this.localDB = new DatabaseUtil(false, false, {
      database: 'wah',
      host: '127.0.0.1',
      user: 'root',
      password: 'root'
    });
    this.awsDB = new DatabaseUtil(false);
    this.util = new RDSQueryUtil('itemPriceHistoryPerDay');
  }

  end() {
    this.awsDB.end();
    this.localDB.end();
  }

  getAllForRealmAndMonth(ahId: number, year: number, month: number): Promise<AuctionItemStatDays[]> {
    /*
    Used for getting a partial period
    const columns = AuctionProcessorUtil.getDailyColumnsSince(
      14, new Date('01/16/2021'), true).columns.join(', ');

    date, ahId, itemId, petSpeciesId, bonusIds, ${columns}
    */
    return this.localDB.query(`
      SELECT *
      FROM itemPriceHistoryPerDay
      WHERE ahId = ${ahId} AND date = '${year}-${month}-15';;
    `);
  }

  cleanAndInsertData(list: AuctionItemStatDays[], year: number, month: number): Promise<void> {
    const splitList = AuctionProcessorUtil.splitEntries(list.map(original => ({
      ...original,
      date: `${year}-${month}-15`
    })));
    return new Promise<void>((resolve, reject) => {
      Promise.all(
        splitList.map(rows =>
          this.awsDB.query(this.util.multiInsertOrUpdate(rows, false))))
        .then((ok) => {
          resolve();
        })
        .catch(reject);
    });
  }

  migrate(ahId: number, year: number, month: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.localDB.enqueueHandshake(),
        this.awsDB.enqueueHandshake()
      ])
        .then(() => {
          this.getAllForRealmAndMonth(ahId, year, month)
            .then(result => {
              this.cleanAndInsertData(result, year, month)
                .then(() => resolve())
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

describe('StatsMigrationToolUtil', () => {
  it('Do something', async () => {
    environment.test = false;
    jest.setTimeout(99999999);
    const util = new StatsMigrationToolUtil();
    const realmRepo = new RealmRepository();
    const ahs = await realmRepo.getAll();
    let completed = 0;
    const list = ahs.filter(a => a.id > 0).sort((a, b) => a.id - b.id);
    for (const ah of list) {
      await util.migrate(ah.id, 2020, 10);
      completed++;
      console.log(`Processing id=${ah.id} -  ${completed} of ${list.length} (${Math.round(completed / list.length * 100)}%)`);
    }
    util.end();

    expect(1).toBe(1);
  });
});