import {LogService} from './log.service';
import {DatabaseUtil} from '../../utils/database.util';

describe('LogService', () => {
  xdescribe('Not really a test', () => {
    it('processAccessLogs', async () => {
      jest.setTimeout(10 * 1000);
      await new LogService(undefined, new DatabaseUtil(false))
        .processAccessLogs()
        .catch(console.error);
      expect(1).toBe(2);
    });
  });
});