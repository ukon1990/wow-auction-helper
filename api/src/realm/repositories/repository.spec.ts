import {RealmRepository} from './realm.repository';
import {RealmStatus} from '../../shared/models';
import {AuctionHouse} from '../model';
import {RealmService} from '../service';
import {BaseRepository} from '../../repository/base.repository';

// import {User} from '../../../../client/src/client/models/user/user';
interface User {
  id?: number;
  region: string;
  realm: string;
}
interface DBUser extends User {
  lastModified: number;
}
class UserSettingRepository extends BaseRepository<DBUser> {
  constructor() {
    super('wah_user_settings');
  }

  add(data: User): Promise<DBUser> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<DBUser[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<DBUser> {
    return Promise.resolve(undefined);
  }
}

describe('RealmRepository', () => {
  const repository: RealmRepository = new RealmRepository();

  it('Can get all realms for house', async () => {
    const realms: RealmStatus[] = await repository.getRealmsSeparated(79);

    expect(realms).toBeTruthy();
    expect(realms.length).toBe(2);
    expect(realms[0].slug).toBe('emerald-dream');
    expect(realms[0].ahId).toBe(79);
    expect(realms[1].slug).toBe('terenas');
  });

  it('Can collect a list of all the realms', async () => {
    const realms: RealmStatus[] = (await repository.getAllRealmsSeparated()).realms;

    expect(realms).toBeTruthy();
    expect(realms.length).toBe(556);
  });

  it('Realms sorted by update', async () => {
    let realms: AuctionHouse[];

    await repository.getRealmsToUpdate()
      .then(r => realms = r)
      .catch(console.error);
    console.log(realms);

    expect(realms.length)
      .toBe(10);
  });

  describe('Maintenance', () => {

    xdescribe('Realm connection migration', () => {
      it('Migrate', async () => {
        await repository.realmConnection(257, 256)
          .then(console.log)
          .catch(console.error);
        expect(2).toBe(3);
      });
    });


    xit('Update', async () => {
      jest.setTimeout(9999999);
      let realms: AuctionHouse[] = [];
      const service = new RealmService();
      await repository.getAll().then(list =>
        realms = list.filter(realm => realm.lastRequested <= 1624744800000))
        .catch(console.error);

      console.log('Realms to update', realms.length);
      /*
      for (const realm of realms) {
        await service.updateLastRequested(realm.id, 1624140000000);
      }
      */


      expect(1).toBe(2);
    });

    xit('Checking the unique number of auction houses/realms that has user settings', async () => {
      const service = new RealmService();

      const userSettingsRealmAndRegion = {};
      const ahIdMap = {};
      const repo = new UserSettingRepository();
      const allHouses = await repository.getAll() as AuctionHouse[];
      const houseIdMap = new Map<number, AuctionHouse>();
      allHouses.forEach(house => houseIdMap.set(house.id, house));
      repository.getAllRealmsSeparated()
        .then(async ({realms}) => {
          realms.forEach(({ahId, region, slug}) => {
            const key = `${region}-${slug}`;
            if (!ahIdMap[key]) {
              ahIdMap[key] = ahId;
            }
          });
        })
        .catch(console.error);
      await repo.getAll()
        .then(users => users.forEach(async ({region, realm, lastModified}) => {
          const key = `${region}-${realm}`;
          const id = ahIdMap[key];
          if (!userSettingsRealmAndRegion[id] && lastModified >= 1622385036065) {
            userSettingsRealmAndRegion[id] = {
              region,
              realm
            };
            if (houseIdMap.get(id).lastRequested <= +new Date(+new Date() - 1000 * 60 * 60 * 24 * 5)) {
              console.log('Actually active', new Date(+new Date() - 1000 * 60 * 60 * 24 * 5), realm, region);
              await service.updateLastRequestedWithRegionAndSlug(region, realm);
            }
          }
        }))
        .catch(console.error);

      expect(Object.keys(userSettingsRealmAndRegion).length).toBe(1);
    });
  });
});