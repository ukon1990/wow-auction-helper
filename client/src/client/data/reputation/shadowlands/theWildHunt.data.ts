import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const theWildHunt: ReputationVendor = {
  id: 2465,
  name: 'The Wild Hunt',
  vendors: [
    new Vendor('Aithlyn', true, true, [{x: 48.5, y: 50.4}]),
  ],
  expansion: 8,
  professions: {
    165: [
      new ReputationVendorRecipe(44561, 'Pattern: Heavy Desolate Armor Kit', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
    773: [
      new ReputationVendorRecipe(44892, 'Technique: Contract: The Wild Hunt', 1, [1765 * 100000, 0, 0], Standing.Revered),
    ],
    171: [
      new ReputationVendorRecipe(42315, 'Recipe: Eternal Cauldron', 1, [1765 * 100000, 0, 0], Standing.Revered),
    ],
    333: [
      new ReputationVendorRecipe(42676, 'Formula: Sacred Shard', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
  },
  isAlly: true,
  isHorde: true,
};
