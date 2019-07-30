import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
export const theUnshackled: ReputationVendor = {
  id: 2373,
  name: 'The Unshackled',
  vendors: [
    new Vendor('Atolia Seapearl', false, true, [], 154002 )
  ],
  expansion: 7,
  professions: {
    Alchemy: [
      new ReputationVendorRecipe(298864, 'Greater Mystical Cauldron', 3, [1900 * 1000, 0, 0], 'Exalted'),
      new ReputationVendorRecipe(298746, 'Potion of Focused Resolve', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(298728, 'Potion of Empowered Proximity', 3, [1400 * 1000, 0, 0], 'Revered')
    ],
    Enchanting: [
      new ReputationVendorRecipe(298011, 'Enchant Ring - Accord of Critical Strike', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(298016, 'Enchant Ring - Accord of Haste', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(298002, 'Enchant Ring - Accord of Mastery', 3, [1400 * 1000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(297999, 'Enchant Ring - Accord of Versatility', 3, [1400 * 1000, 0, 0], 'Revered')
    ],
    Inscription: [
      new ReputationVendorRecipe(299668, 'Contract: Unshackled', 3, [1400 * 1000, 0, 0], 'Revered')
    ]
  },
  isAlly: false,
  isHorde: true
};
