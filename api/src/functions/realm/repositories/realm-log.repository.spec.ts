import {RealmLogRepository} from './realm-log.repository';
import {AuthHandler} from '../../handlers/auth.handler';
import {RealmService} from '../service';

describe('RealmLogRepository', () => {
  it('getUpdateDelays', async () => {
    await new RealmLogRepository().getUpdateDelays(69)
      .then(console.log)
      .catch(console.error);
    expect(1).toBe(2);
  });
  it('getRealmsToUpdate', async () => {
    jest.setTimeout(999999);
    await AuthHandler.getToken();
    //  OR attribute_not_exists(#nextUpdate)
    // await new AuctionService().getLatestDumpPath(4618, 'eu', GameBuildVersion.Classic)// .updateAllHouses()
    await new RealmService().updateAllRealmStatuses()
      .then(console.log)
      .catch(console.error);
    expect(1).toBe(2);
  });
});
