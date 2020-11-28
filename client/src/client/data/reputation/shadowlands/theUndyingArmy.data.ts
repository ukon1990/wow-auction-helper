import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const theUndyingArmy: ReputationVendor = {
  id: 2465,
  name: 'The Undying Army ',
  vendors: [
    new Vendor('Nalcorn Talsen', true, true, [{x: 50.8, y: 53.4}]),
  ],
  expansion: 8,
  professions: {
    164: [
      new ReputationVendorRecipe(43553, 'Plans: Shadowsteel Pauldrons', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
    197: [
      new ReputationVendorRecipe(42817, 'Pattern: Shadowlace Cloak', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
    202: [
      new ReputationVendorRecipe(42766, 'Schematic: Wormhole Generator: Shadowlands', 1, [1350 * 100000, 0, 0], Standing.Honored),
    ],
    773: [
      new ReputationVendorRecipe(44894, 'Technique: Contract: The Undying Army', 1, [1765 * 100000, 0, 0], Standing.Revered),
    ],
  },
  isAlly: true,
  isHorde: true,
};
