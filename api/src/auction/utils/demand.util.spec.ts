import {Demand} from '../models/demand.model';
import {Auction} from '../../models/auction/auction';
import {DemandUtil} from './demand.util';
import {BaseRepository} from '../../repository/base.repository';

class TmpRepository extends BaseRepository<any> {
  constructor() {
    super('wah_auction_houses_update_log');
  }

  getUpdateLog(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.db.executeStatement({
        Statement: `SELECT *
                  FROM ${this.table}
                  WHERE id = ${id}
                  ORDER BY lastModified DESC;`
      }, (error, output) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(output.Items);
        }
      });
    });
  }

  add(data: any): Promise<any> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<any[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<any> {
    return Promise.resolve(undefined);
  }

}

describe('DemandUtil', () => {
  const previous: Auction[] = [
    new Auction(1, 1, 1, 30),
    new Auction(2, 1, 5, 20),
    new Auction(3, 1, 3, 10),
    new Auction(4, 1, 2, 5),
  ];
  const current: Auction[] = [
    new Auction(5, 1, 2, 30),
    new Auction(2, 1, 5, 20),
    new Auction(3, 1, 3, 10),
    new Auction(4, 1, 2, 5),
  ];

  it('Check if same auc can have different quantity between versions', async () => {
    const result: {
      id: number;
      lastModified: number;
      url: string;
    }[] = await new TmpRepository().getUpdateLog(69);

    // TODO!
    expect(result.length).toBe(2);
  });
  it('Can calculate demand', () => {
    const util = new DemandUtil(previous, current, +new Date());
    const [result]: Demand[] = util.calculate();
    expect(result.new).toEqual(.3);
    expect(result.removed).toEqual(.3);
    expect(result.demand).toEqual(.3);
  });
});
