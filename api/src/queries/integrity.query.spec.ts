import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {QueryIntegrity} from './integrity.query';
import {ItemLocale} from '../models/item/item-locale';
import {PetUtil} from '../utils/pet.util';
import {Item} from '../../../client/src/client/models/item/item';
import {ItemUtil} from '../utils/item.util';
import {ItemHandler} from '../handlers/item.handler';

describe('QueryIntegrity', () => {
  it('It will return back only values that has a column in DB', async () => {
    const pet: Pet = await PetUtil.getPet(39);
    const result = await QueryIntegrity.getVerified('pets', pet);
    expect(Object.keys(result).length).toBe(5);

    const item: Item = await new ItemHandler().getFreshItem(109118, 'en_GB');
    const okItem = await QueryIntegrity.getVerified('items', item);
    console.log('Item ok', okItem);
    expect(Object.keys(okItem).length).toBe(12);
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
    pet.timestamp = 3;
    const result = await QueryIntegrity.getVerified('pets', pet);
    expect(result).toBeFalsy();
  });
});
