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
    });

  });
});
