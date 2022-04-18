import {Item, ItemLocale, Pet} from '../shared/models';
import {QueryIntegrity} from './integrity.query';
import {PetUtil} from '../utils/pet.util';
import {ItemHandler} from '../handlers/item.handler';

describe('QueryIntegrity', () => {
  it('It will return back only values that has a column in DB', async () => {
    jest.setTimeout(60000);
    const pet: Pet = await PetUtil.getPet(39);
    const result = await QueryIntegrity.getVerified('pets', pet);
    expect(Object.keys(result).length).toBe(5);

    let item: Item = await new ItemHandler().getFreshItem(109118, 'en_GB');
    let okItem = await QueryIntegrity.getVerified('items', item);
    expect(Object.keys(okItem).length).toBe(13);


    item = await new ItemHandler().getFreshItem(165023, 'en_GB');
    okItem = await QueryIntegrity.getVerified('items', item);
    expect(Object.keys(okItem).length).toBe(10);
  });

  it('Returns falsy if there is no data integrity', async () => {
    const pet: Pet = new Pet();
    pet.name = 'asd';
    pet.icon = 'icon';
    pet.source = 'PROFESSION';
    pet.nameLocales = new ItemLocale();
    pet.description = '';
    pet.canBattle = true;
    pet.isCapturable = true;
    pet.isTradable = true;
    pet.assets = [];
    pet.timestamp = '3';
    const result = await QueryIntegrity.getVerified('pets', pet);
    expect(result).toBeFalsy();
  });
});