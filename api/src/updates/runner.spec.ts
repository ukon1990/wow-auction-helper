/**
 * This file is not intented for testing, but to make it less bothersome to update the S3 files
 * with the latest items etc, allowing for reduced API calls from clients etc
 */
import {DatabaseUtil} from '../utils/database.util';
import {UpdatesService} from './service';

describe('Update runner', () => {
  let db: DatabaseUtil;
  beforeAll(() => {
    db = new DatabaseUtil(false);
  });

  afterAll(() => {
    db.end();
  });

  it('Update timestamps', async () => {
    const timestamps = await UpdatesService.getAndSetTimestamps(db)
      .catch(console.error);
    console.log(timestamps);
    expect(timestamps).toBeTruthy();
  });
});
