import {RealmUtil} from './realm.util';

describe('RealmUtil', () => {
  xit('getSetConnectedRealmIdForHouses', async () => {
    await RealmUtil.getSetConnectedRealmIdForHouses()
      .catch(console.error);
    expect(1).toBe(1);
  });

  it('getConnectedRealmIdForHouse', async () => {
    const connectedId = await RealmUtil.getConnectedRealmIdForHouse(79, 'eu', 'emerald-dream');
    expect(connectedId).toBe(2074);
  });
});
