import {environment} from '../../../client/src/environments/environment';
import {ItemHandler} from './item.handler';
import {Item} from '../../../client/src/client/models/item/item';

describe('ItemHandler', () => {
  let originalEnvironment;
  beforeAll(() => {
    originalEnvironment = environment.test;
    environment.test = true;
  });
  afterAll(() => {
    environment.test = originalEnvironment;
  });

  it('Can get complete item', async () => {
    jest.setTimeout(10000);
    const item: Item = await new ItemHandler().getFreshItem(109118, 'en_GB');
    console.log('Item data', item);
    expect(item.itemSource.droppedBy.length).toBe(10);
    expect(item.expansionId).toBe(5);
    expect(item.patch).toBe('6.0.1.18125');
  });
});
