import {environment} from '../../../client/src/environments/environment';
import {Item} from '../models/item/item';
import {ItemUtil} from './item.util';

describe('ItemUtil', () => {
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
      const result: Item = await ItemUtil.getFromBlizzard(id, 'en_GB');
      expect(result.id).toBe(id);
      expect(result.name).toBe('Static Induction Matrix');
      expect(result.icon).toBe('inv_gizmo_hardenedadamantitetube');
      expect(result.itemLevel).toBe(120);
      expect(result.itemClass).toBe(15);
      expect(result.itemSubClass).toBe(4);
      expect(result.quality).toBe(3);
      expect(result.buyPrice).toBe(0);
      expect(result.sellPrice).toBe(5);
      expect(result.itemBind).toBe(1);
      expect(result.minFactionId).toBe(0);
      expect(result.minReputation).toBe(0);
    });

    it('Returns undefined if ID is bogus', async () => {
      await expect(ItemUtil.getFromBlizzard(-90, 'en_GB'))
        .rejects
        .toEqual('Could not find item with id=-90 from Blizzard');
    });
  });
});
