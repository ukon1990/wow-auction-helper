import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {QueryIntegrity} from './integrity.query';
import {ItemLocale} from '../models/item/item-locale';

describe('QueryIntegrity', () => {
  it('It will return back only values that has a column in DB', async () => {
    const pet: Pet = new Pet();
    pet.speciesId = 1;
    pet.name = ':)';
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
    expect(Object.keys(result).length).toBe(Object.keys(pet).length);
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
