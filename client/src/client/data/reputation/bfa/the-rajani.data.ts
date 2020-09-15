import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const theRajani: ReputationVendor = {
  id: 2415,
  name: 'The Rajani',
  vendors: [
    new Vendor('Zhang Ku', true, true, [], 160711)
  ],
  expansion: 7,
  professions: {
    773: [
      new ReputationVendorRecipe(42442, 'Contract: Rajani', 1, [1400 * 10000, 0, 0], 'Revered')
    ]
  },
  isAlly: true,
  isHorde: true
};
