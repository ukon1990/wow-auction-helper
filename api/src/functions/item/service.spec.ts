import {ItemServiceV2} from './service';
import {environment} from '../../../../client/src/environments/environment';
import {NameSpace} from '../../enums/name-space.enum';
import {Item} from '../../shared/models';

describe('ItemService', () => {
  xit('Update', async () => {
    jest.setTimeout(999999);
    environment.test = false;

    const service = new ItemServiceV2();
    await service.updateExistingItemsForCurrentExpansion()
      .catch(console.error);

    environment.test = true;
    expect(2).toBe(1);
  });

  it('findMissingItemsAndImport', async () => {
    jest.setTimeout(9999999);
    environment.test = false; // 13302 -> Does not follow the model?

    const service = new ItemServiceV2(true);
    await service.findMissingItemsAndImport()
      .catch(console.error);

    environment.test = true;
    expect(2).toBe(1);
  });

  it('getFreshItem', async () => {
    jest.setTimeout(9999999);
    environment.test = false;

    const service = new ItemServiceV2(true); // 24047
    let item: Item;
    await service.getFreshItem(32474, 'en_GB', NameSpace.STATIC_CLASSIC)
      .then(i => item = i)
      .catch(console.error);

    console.log('Res', item);
    environment.test = true;
    expect(item.classicPhase).toBe(5);
  });
});