import {Pet} from '../../../client/src/client/modules/pet/models/pet';
import {QueryIntegrity} from './integrity.query';

describe('QueryIntegrity', () => {
  it('It will return back only values that has a column in DB', async () => {
    const pet: Pet = new Pet();
    pet.speciesId = 1;
    pet.name = 'asd';
    pet.icon = 'icon';
    pet.source = 'PROFESSION';
    const result = await QueryIntegrity.getVerified('pets', pet);
    expect(Object.keys(result).length).toBe(Object.keys(pet).length);
  });
});
