import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const rustboltResistance: ReputationVendor = {
  id: 2391,
  name: 'Rustbolt Resistance',
  vendors: [
    new Vendor('Stolen Royal Vendorbot', true, true, [], 150716)
  ],
  expansion: 7,
  professions: {
    Cooking: [
      new ReputationVendorRecipe(297106, 'Famine Evaluator And Snack Table', 2, [1900 * 1000, 0, 0], 'Exalted')],
    Engineering: [
      new ReputationVendorRecipe(298930, 'Blingtron 7000', 1, [1900 * 1000, 0, 0], 'Exalted')],
    Inscription: [
      new ReputationVendorRecipe(299671, 'Contract: Rustbolt Resistance', 1, [1400 * 1000, 0, 0], 'Revered')]
  },
  isAlly: false,
  isHorde: true
};
