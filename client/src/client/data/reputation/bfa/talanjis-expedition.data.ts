import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const talanjisExpedition: ReputationVendor = {
  id: 2156,
  name: 'Talanji\'s Expedition',
  vendors: [
    new Vendor('Provisioner Lija', false, true, []),
  ],
  expansion: 7,
  professions: {
    171: [
      new ReputationVendorRecipe(39861, 'Battle Potion of Intellect', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38793, 'Flask of the Vast Horizon', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38820, 'Coastal Mana Potion', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38781, 'Potion of Bursting Blood', 3, [14000000, 0, 0], 'Revered'),
    ],
    333: [
      new ReputationVendorRecipe(38873, 'Pact of Mastery', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38882, 'Enchant Weapon - Siphoning', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39422, 'Enchant Weapon - Masterful Navigation', 3, [14000000, 0, 0], 'Revered'),
    ],
    202: [
      new ReputationVendorRecipe(39602, 'AZ3-R1-T3 Bionic Bifocals', 2, [11000000, 0, 0], 'Honored'),
      new ReputationVendorRecipe(39603, 'AZ3-R1-T3 Bionic Bifocals', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38934, 'Finely-Tuned Stormsteel Destroyer', 3, [14000000, 0, 0], 'Revered'),
    ],
    773: [
      new ReputationVendorRecipe(38954, 'Contract: Talanji\'s Expedition', 2, [11000000, 0, 0], 'Friendly'),
    ],
    755: [
      new ReputationVendorRecipe(39013, 'Tidal Amethyst Loop', 3, [14000000, 0, 0], 'Revered'),
    ],
    165: [
      new ReputationVendorRecipe(39063, 'Mistscale Knuckles', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39066, 'Hardened Tempest Knuckles', 3, [14000000, 0, 0], 'Revered'),
    ]
  },
  isAlly: false,
  isHorde: true
};
