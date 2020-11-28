import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const theAvowed: ReputationVendor = {
  id: 2439,
  name: 'The Avowed',
  vendors: [
    new Vendor('Archivist Janeera', true, true, [{x: 73.1, y: 52.1}]),
  ],
  expansion: 8,
  professions: {
    171: [
      new ReputationVendorRecipe(42337, 'Recipe: Shadestone', 3, [35, 0, 1816], Standing.Honored),
    ],
    333: [
      new ReputationVendorRecipe(42659, 'Formula: Enchanted Elethium Bar', 0, [50, 0, 1816], Standing.Friendly),
   ],
    164: [
      new ReputationVendorRecipe(45767, 'Pattern: Crafter\'s Mark III', 0, [50, 0, 1816], Standing.Revered),
   ],
  },
  isAlly: true,
  isHorde: true
};
