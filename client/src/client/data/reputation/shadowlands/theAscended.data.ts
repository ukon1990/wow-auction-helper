import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const theAscended: ReputationVendor = {
  id: 2407,
  name: 'The Ascended',
  vendors: [
    new Vendor('Adjutant Nikos', true, true, [{x: 52.2, y: 47.1}]),
  ],
  expansion: 8,
  professions: {
    202: [
      new ReputationVendorRecipe(45159, 'Schematic: PHA7-YNX', 3, [40 * 100, 0, 0], 'Exalted'),
    ],
    773: [
      new ReputationVendorRecipe(42875, 'Technique: Codex of the Still Mind', 0, [8 * 100, 0, 0], 'Friendly'),
      new ReputationVendorRecipe(44893, 'Technique: Contract: The Ascended', 0, [1765 * 10000, 0, 0], 'Revered'),
    ],
    164: [
      new ReputationVendorRecipe(43551, 'Plans: Shadowsteel Helm', 0, [21 * 10000, 0, 0], 'Honored'),
    ],
  },
  isAlly: true,
  isHorde: true
};
