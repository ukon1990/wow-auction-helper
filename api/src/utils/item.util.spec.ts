import {environment} from '../../../client/src/environments/environment';
import {ItemUtil} from './item.util';
import {Item} from '@shared/models';
import {ItemServiceV2} from '../item/service';

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
    });

    it('Returns undefined if ID is bogus', async () => {
      await expect(ItemUtil.getFromBlizzard(-90, 'en_GB'))
        .rejects
        .toEqual('Could not find item with id=-90 from Blizzard');
    });
  });

  it('handleItems && handleItem', () => {
    const raw = {
      id: 0,
      itemSource: `{
      "containedInItem":[],
      "containedInObject":[],
      "currencyFor":[],
      "soldBy":[],
      "droppedBy":[],
      "prospectedFrom":[],
      "milledFrom":[]
      }`,
      itemSpells: `[
        {
          "SpellID":433,
          "Trigger":0,
          "Charges":-1,
          "Cooldown":0,
          "CategoryID":11,
          "CooldownCategory":1000,
          "Text":"Restores 83 health over 18 sec. Must remain seated while eating."
        }
      ]`,
      timestamp: 1
    } as unknown as Item;
    const item: Item = ItemUtil.handleItems([raw] as Item[])[0];

    expect(item.itemSpells.length).toBe(1);
    expect(item.itemSource.containedInItem.length).toBe(0);
    expect(item['timestamp']).toBeFalsy();

  });

  it('getItemsByQualityForPatch', async () => {
    jest.setTimeout(999999999);
    const list = await ItemUtil.getNewItemsForPatch(90100);
    console.log('ids', list.map(l => l.id).join(','));
    const itemService = new ItemServiceV2();
    /*
    const db = new DatabaseUtil(false);
    await itemService.addOrUpdateItemsByIds(list.map(l => l.id), db)
      .catch(console.error);
    db.end();
    */
    expect(list.length).toBe(315);
  });
});