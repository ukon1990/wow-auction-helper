import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const theHonorbound: ReputationVendor = {
  id: 2157,
  name: 'The Honorbound',
  vendors: [
    new Vendor('Ransa Greyfeather', false, true, []),
  ],
  expansion: 7,
  professions: {
    171: [
      new ReputationVendorRecipe(38775, 'Steelskin Potion', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38787, 'Flask of the Currents', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38811, 'Endless Tincture of Fractional Power', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38814, 'Surging Alchemist Stone', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39867, 'Battle Potion of Strength', 3, [14000000, 0, 0], 'Revered'),
    ],
    164: [
      new ReputationVendorRecipe(38743, 'Stormsteel Shield', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38769, 'Stormsteel Dagger', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38772, 'Stormsteel Spear', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39833, 'Stormsteel Saber', 3, [14000000, 0, 0], 'Revered'),
    ],
    333: [
      new ReputationVendorRecipe(38867, 'Pact of Critical Strike', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39542, 'Enchanter\'s Sorcerous Scepter', 3, [14000000, 0, 0], 'Revered'),
    ],
    202: [
      new ReputationVendorRecipe(39596, 'AZ3-R1-T3 Synthetic Specs', 2, [11000000, 0, 0], 'Honored'),
      new ReputationVendorRecipe(39597, 'AZ3-R1-T3 Synthetic Specs', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39240, 'Monelite Scope of Alacrity', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39231, 'Precision Attitude Adjuster', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38934, 'Finely-Tuned Stormsteel Destroyer', 3, [14000000, 0, 0], 'Revered'),
    ],
    773: [
      new ReputationVendorRecipe(40135, 'Contract: The Honorbound', 2, [11000000, 0, 0], 'Friendly'),
    ],
    755: [
      new ReputationVendorRecipe(39007, 'Amberblaze Loop', 3, [14000000, 0, 0], 'Revered'),
    ]
  },
  isAlly: false,
  isHorde: true
};
