import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const courtOfHarvesters: ReputationVendor = {
  id: 2413,
  name: 'Court of Harvesters',
  vendors: [
    new Vendor('Mistress Mihaela ', true, true, [{x: 61.3, y: 63.8}]),
  ],
  expansion: 8,
  professions: {
    185: [
      new ReputationVendorRecipe(42449, 'Recipe: Feast of Gluttonous Hedonism', 1, [1765 * 100000, 0, 0], Standing.Revered),
    ],
    755: [
      new ReputationVendorRecipe(42924, 'Design: Revitalizing Jewel Doublet', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
    165: [
      new ReputationVendorRecipe(44653, 'Pattern: Heavy Desolate Hide', 1, [1765 * 100000, 0, 0], Standing.Revered),
    ],
    773: [
      new ReputationVendorRecipe(45781, 'Technique: Crafter\'s Mark III', 1, [2000 * 100000, 0, 0], Standing.Revered),
        new ReputationVendorRecipe(44895, 'Technique: Contract: Court of Harvesters', 1, [1350 * 100000, 0, 0], Standing.Revered),
    ],
  },
  isAlly: true,
  isHorde: true,
};
