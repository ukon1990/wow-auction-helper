import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const wavebladeAnkoan: ReputationVendor = {
  id: 2400,
  name: 'Waveblade Ankoan',
  vendors: [
    new Vendor('Speaker Utia', true, false, [], 154140 )
  ],
  expansion: 7,
  professions: {
    171: [
      new ReputationVendorRecipe(40697, 'Greater Mystical Cauldron', 3, [1900 * 1000, 0, 0], 'Exalted'),
      new ReputationVendorRecipe(40668, 'Potion of Focused Resolve', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(40656, 'Potion of Empowered Proximity', 3, [1400 * 1000, 0, 0], 'Revered')
    ],
    333: [
      new ReputationVendorRecipe(40636, 'Enchant Ring - Accord of Critical Strike', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(40621, 'Enchant Ring - Accord of Haste', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(40615, 'Enchant Ring - Accord of Mastery', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(40618, 'Enchant Ring - Accord of Versatility', 3, [1400 * 1000, 0, 0], 'Revered')
    ],
    773: [
      new ReputationVendorRecipe(40762, 'Contract: Ankoan', 3, [1400 * 1000, 0, 0], 'Revered')
    ]
  },
  isAlly: true,
  isHorde: false
};
