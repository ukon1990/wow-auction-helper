import {PetUtil} from './pet.util';
import {Pet} from '../../../client/src/client/modules/pet/models/pet';

describe('PetUtil', () => {
  describe('getPet', () => {
    it('can get valid id', async () => {
      const id = 39;
      const pet: Pet = await PetUtil.getPet(id);
      expect(pet.speciesId).toBe(id);
      // Is now a string: expect(pet.petTypeId).toBe(9);
      // Deprecated param! -> expect(pet.creatureId).toBe(2671);
      expect(pet.name).toBe('Mechanical Squirrel');
      expect(pet.source).toBe('PROFESSION');
      expect(pet.canBattle).toBe(true);
      expect(pet.icon).toBe('inv_pet_mechanicalsquirrel');
    });
  });
});
