import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const theUldumAccord: ReputationVendor = {
  id: 2417,
  name: 'The Uldum Accord',
  vendors: [
    new Vendor('Provisioner Qorra', true, true, [], 160714)
  ],
  expansion: 7,
  professions: {
    Inscription: [
      new ReputationVendorRecipe(299673, 'Contract: Uldum Accord', 1, [1400 * 10000, 0, 0], 'Revered')
    ]
  },
  isAlly: true,
  isHorde: true
};
