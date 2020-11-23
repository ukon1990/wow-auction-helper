/**
 * This file is not intended for testing, but to make it less bothersome to update the S3 files
 * with the latest items etc, allowing for reduced API calls from clients etc
 */
import {DatabaseUtil} from '../utils/database.util';
import {UpdatesService} from './service';

describe('Update runner', () => {
  beforeAll(() => {
    jest.setTimeout(999999);
  });

  it('Update timestamps', async () => {
    const timestamps = await UpdatesService.getAndSetTimestamps()
      .catch(console.error);
    console.log(timestamps);
    expect(timestamps).toBeTruthy();
  });

  it('Update recipes', async () => {
    const timestamps = await UpdatesService.getAndSetRecipes()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });

  it('Update items', async () => {
    const timestamps = await UpdatesService.getAndSetItems()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });

  it('Update NPCs', async () => {
    const timestamps = await UpdatesService.getAndSetNpc()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });

  it('Update zones', async () => {
    const timestamps = await UpdatesService.getAndSetZones()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });

  it('Update getAndSetProfessions', async () => {
    const timestamps = await UpdatesService.getAndSetProfessions()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });

  it('Update item classes', async () => {
    const timestamps = await UpdatesService.getAndSetItemClasses()
      .catch(console.error);
    expect(timestamps).toBeTruthy();
  });
});
