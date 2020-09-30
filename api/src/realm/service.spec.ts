import {RealmService} from './service';
import {RealmLogRepository} from './repository';

describe('RealmService', () => {
  const service: RealmService = new RealmService();

  describe('Not a test', () => {
    xit('Migrate', async () => {
      await service.extractRDSDataToDynamoDB()
        .catch(console.error);
      expect(1).toBe(2);
    });
  });
});

describe('RealmLogRepository', () => {
  it('getUpdateDelays', async () => {
    await new RealmLogRepository().getUpdateDelays(69)
      .then(console.log)
      .catch(console.error);
    expect(1).toBe(2);
  });
});
