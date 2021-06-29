import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const deathsAdvance: ReputationVendor = {
  id: 2413,
  name: `Death's advance`,
  vendors: [// https://www.wowhead.com/guides/deaths-advance-reputation-guide
    new Vendor('Duchess Mynx', true, true, [{x: 63.4, y: 23.4}], 179321),
  ],
  expansion: 8, // Tome of origins is for all professions
  professions: {
    164: [
      new ReputationVendorRecipe(45739, 'Recipe: Crafter\'s Mark III', 1, [2000, 0, 1767], Standing.Honored),
      new ReputationVendorRecipe(46066, 'Tome of Origins', 1, [2000, 0, 1767], Standing.Honored),
    ],
    165: [
      new ReputationVendorRecipe(45739, 'Recipe: Crafter\'s Mark III', 1, [2000, 0, 1767], Standing.Honored),
      new ReputationVendorRecipe(46068, 'Tome of Origins', 1, [2000, 0, 1767], Standing.Honored),
    ],
    197: [
      new ReputationVendorRecipe(45739, 'Recipe: Crafter\'s Mark III', 1, [2000, 0, 1767], Standing.Honored),
      new ReputationVendorRecipe(46069, 'Tome of Origins', 1, [2000, 0, 1767], Standing.Honored),
    ],
    202: [
      new ReputationVendorRecipe(45739, 'Recipe: Crafter\'s Mark III', 1, [2000, 0, 1767], Standing.Honored),
    ],
    755: [
      new ReputationVendorRecipe(45739, 'Recipe: Crafter\'s Mark III', 1, [2000, 0, 1767], Standing.Honored),
      new ReputationVendorRecipe(46067, 'Tome of Origins', 1, [2000, 0, 1767], Standing.Honored),
    ],
    773: [// item id = 186598
      // Item id = 186724
      new ReputationVendorRecipe(1, 'Technique: Contract: Death\'s Advance', 1, [2500, 0, 1767], Standing.Revered),
     ],
  },
  isAlly: true,
  isHorde: true,
};
