import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const voldunai: ReputationVendor = {
  id: 2158,
  name: 'Voldunai',
  vendors: [
    new Vendor('Hoarder Jena', false, true, []),
  ],
  expansion: 7,
  professions: {
    171: [
      new ReputationVendorRecipe(39858, 'Battle Potion of Agility', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38796, 'Flask of the Undertow', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38784, 'Potion of Rising Death', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38823, 'Coastal Rejuvenation Potion', 3, [14000000, 0, 0], 'Revered'),
    ],
    333: [
      new ReputationVendorRecipe(38876, 'Pact of Versatility', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38885, 'Weapon Enchant - Gale-Force Striking', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39416, 'Weapon Enchant - Versatile Navigation', 3, [14000000, 0, 0], 'Revered'),
    ],
    202: [
      new ReputationVendorRecipe(39605, 'AZ3-R1-T3 Orthogonal Optics', 2, [11000000, 0, 0], 'Honored'),
      new ReputationVendorRecipe(39246, 'Frost-Laced Ammunition', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39606, 'AZ3-R1-T3 Orthogonal Optics', 3, [14000000, 0, 0], 'Revered'),
    ],
    773: [
      new ReputationVendorRecipe(38957, 'Contract: Voldunai', 2, [11000000, 0, 0], 'Friendly'),
    ],
    755: [
      new ReputationVendorRecipe(39016, 'Royal Quartz Loop', 3, [14000000, 0, 0], 'Revered'),
    ],
    165: [
      new ReputationVendorRecipe(39060, 'Recurve Bow of the Strands', 3, [14000000, 0, 0], 'Revered'),
    ],
    197: [
      new ReputationVendorRecipe(39069, 'Deep Sea Bag', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39092, 'Embroidered Deep Sea Cloak', 3, [14000000, 0, 0], 'Revered'),
    ]
  },
  isAlly: false,
  isHorde: true
};
