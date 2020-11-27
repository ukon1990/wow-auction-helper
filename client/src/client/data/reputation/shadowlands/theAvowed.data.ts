import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const theAvowed: ReputationVendor = {
  id: 2439,
  name: 'The Avowed',
  vendors: [
    new Vendor('Archivist Janeera', true, true, [{x: 73.1, y: 52.1}]),
  ],
  expansion: 8,
  professions: {
    171: [
      new ReputationVendorRecipe(42337, 'Recipe: Shadestone', 3, [35, 0, 1816], 'Honored'),
    ],
    333: [
      new ReputationVendorRecipe(42659, 'Formula: Enchanted Elethium Bar', 0, [50, 0, 1816], 'Friendly'),
   ],
  },
  isAlly: true,
  isHorde: true
};
