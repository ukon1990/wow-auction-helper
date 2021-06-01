import {RealmLogRepository} from './realm-log.repository';
import {AuctionService} from '../../auction/services/auction.service';
import {GameBuildVersion} from '../../../../client/src/client/utils/game-build.util';
import {AuthHandler} from '../../handlers/auth.handler';

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
    await new AuctionService().getLatestDumpPath(4618, 'beta', GameBuildVersion.Classic)// .updateAllHouses()
    // await new RealmService().updateAllRealmStatuses()
      .then(console.log)
      .catch(console.error);
    expect(1).toBe(2);
  });
});
