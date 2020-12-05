import {RealmLogRepository} from './realm-log.repository';

describe('RealmLogRepository', () => {
  it('getUpdateDelays', async () => {
    await new RealmLogRepository().getUpdateDelays(69)
      .then(console.log)
      .catch(console.error);
    expect(1).toBe(2);
  });
});