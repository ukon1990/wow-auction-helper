import {environment} from '../../../client/src/environments/environment';
import {ItemHandler} from './item.handler';
import {Item} from '../models/item/item';

describe('ItemHandler', () => {
  let originalEnvironment;
  beforeAll(() => {
    originalEnvironment = environment.test;
    environment.test = true;
  });
  afterAll(() => {
    environment.test = originalEnvironment;
  });

  describe('getById', () => {
    it('It works if the id exists', async () => {
      const id = 168154;
      const result: Item = await new ItemHandler().getFromBlizzard(id, 'en_GB');
      expect(result.id).toBe(id);
      expect(result.name).toBe('Static Induction Matrix');
    });

    it('Returns undefined if ID is bogus', async () => {
      await expect(new ItemHandler().getFromBlizzard(-90, 'en_GB'))
        .rejects
        .toEqual('Could not find item with id=-90 from Blizzard');
    });
  });
});
