import {environment} from '../../../../client/src/environments/environment';
import {StatsService} from './stats.service';
import {DatabaseUtil} from '../../utils/database.util';

const PromiseThrottle: any = require('promise-throttle');

describe('StatsService', () => {
  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  xit('Update trend for realm', async () => {
    jest.setTimeout(99999);
    const conn = new DatabaseUtil(false);
    await conn.enqueueHandshake();
    await new StatsService().setRealmTrends('eu', 69, conn);
    conn.end();
    expect(1).toBe(2);
  });
});
