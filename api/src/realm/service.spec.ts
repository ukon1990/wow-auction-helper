import {RealmService} from './service';
import {environment} from '../../../client/src/environments/environment';
import {NameSpace} from '../enums/name-space.enum';
import {AuctionUpdateLog} from '../shared/models';

describe('RealmService', () => {
  const service: RealmService = new RealmService();

  beforeEach(() => environment.test = false);
  afterEach(() => environment.test = true);

  describe('Not a test', () => {
    it('Import new realms', async () => {
      jest.setTimeout(99999);
      // console.log('Token:', await AuthHandler.getToken());
      await service.getAllRealmsFromAPI('beta', NameSpace.DYNAMIC_CLASSIC);
      /* To delete all classic realms
      const repo = new RealmRepository();
      await repo.getAll()
        .then(async realms => {
          for (const realm of realms) {
            if (realm.gameBuild === GameBuildVersion.Classic) {
              await repo.delete(realm.id);
            }
          }
        })
        .catch(console.error);
        */
      expect(1).toBe(2);
    });
  });

  describe('getUpdateLog', () => {
    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new RealmService().getUpdateLog(69, 3);
      expect(log.entries.length).toBeLessThanOrEqual(3);
      expect(log.entries.length).toBeGreaterThanOrEqual(2);
      expect(log.minTime).toBeTruthy();
      expect(log.avgTime).toBeTruthy();
      expect(log.maxTime).toBeTruthy();
    });

    it('Can get the last 3 hours', async () => {
      const log: AuctionUpdateLog = await new RealmService().getUpdateLog(69, 2);
      expect(log.entries.length).toBeLessThanOrEqual(2);
      expect(log.entries.length).toBeGreaterThanOrEqual(1);
      expect(log.minTime).toBe(70);
      expect(log.avgTime).toBe(70);
      expect(log.maxTime).toBe(70);
    });
  });
});