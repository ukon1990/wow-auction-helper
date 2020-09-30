import {RealmRepository} from './repository';
import {RealmStatus} from '../../../client/src/client/models/realm-status.model';
import {AuctionHouse} from './model';

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
    const realms: RealmStatus[] = await repository.getAllRealmsSeparated();

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

  xdescribe('Realm connection migration', () => {
    it('Migrate', async () => {
      await repository.realmConnection(191, 130)
        .then(console.log)
        .catch(console.error);
      expect(2).toBe(3);
    });
  });
});
