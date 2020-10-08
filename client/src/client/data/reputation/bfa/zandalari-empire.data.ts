import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const zandalariEmpire: ReputationVendor = {
  id: 2103,
  name: 'Zandalari Empire',
  vendors: [
    new Vendor('Natal\'hakata', false, true, []),
  ],
  expansion: 7,
  professions: {
    171: [
      new ReputationVendorRecipe(38778, 'Potion of Replenishment', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38790, 'Flask of Endless Fathoms', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38817, 'Coastal Healing Potion', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39864, 'Battle Potion of Stamina', 3, [14000000, 0, 0], 'Revered'),
    ],
    333: [
      new ReputationVendorRecipe(38870, 'Pact of Haste', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39428, 'Weapon Enchant - Stalwart Navigation', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39425, 'Weapon Enchant - Deadly Navigation', 3, [14000000, 0, 0], 'Revered'),
    ],
    202: [
      new ReputationVendorRecipe(39599, 'AZ3-R1-T3 Gearspun Goggles', 2, [11000000, 0, 0], 'Honored'),
      new ReputationVendorRecipe(39600, 'AZ3-R1-T3 Gearspun Goggles', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38915, 'Organic Discombobulation Grenade', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38927, 'Interdimensional Companion Repository', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38930, 'Organic Discombobulation Grenade', 3, [14000000, 0, 0], 'Revered'),
    ],
    773: [
      new ReputationVendorRecipe(38951, 'Contract: Zandalari Empire', 2, [11000000, 0, 0], 'Friendly'),
    ],
    755: [
      new ReputationVendorRecipe(39010, 'Owlseye Loop', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39019, 'Laribole Staff of Alacrity', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39022, 'Diamond Staff of Intuition', 3, [14000000, 0, 0], 'Revered'),
    ]
  },
  isAlly: false,
  isHorde: true
};
