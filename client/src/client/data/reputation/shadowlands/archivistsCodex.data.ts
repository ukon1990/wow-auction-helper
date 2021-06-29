import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

export const archivistsCodex: ReputationVendor = {
  id: 2472,
  name: `Death's advance`,
  vendors: [// https://www.wowhead.com/guides/archivists-codex-reputation-guide
    new Vendor('Archivist Roh-Suir', true, true, [{x: 62.8, y: 22.6}], 178257),
  ],
  expansion: 8, // Tome of origins is for all professions
  professions: {
    164: [
      new ReputationVendorRecipe(46087, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
    ],
    165: [
      new ReputationVendorRecipe(46092, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
    ],
    171: [
      new ReputationVendorRecipe(46086, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
      new ReputationVendorRecipe(46185, 'Transmute: Stones to Ore', 1, [2000, 0, 1931], '4'),
    ],
    197: [
      new ReputationVendorRecipe(46093, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
    ],
    202: [
      new ReputationVendorRecipe(46089, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
    ],
    755: [
      new ReputationVendorRecipe(46091, 'Recipe: Crafter\'s Mark of the Chained Isle', 1, [2500, 0, 1931], '4'),
    ],
  },
  isAlly: true,
  isHorde: true,
};
