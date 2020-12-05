import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';
import {Standing} from '../standings.data';

enum VeNariStanding {
  Dubious = 'Dubious', // 0/1000
  Apprehensive = 'Apprehensive', // 0/6000
  Tentative = 'Tentative', // 0/7000
  Ambivalent = 'Ambivalent', // 0/7000
  Cordial = 'Cordial', // 0/42000
  Appreciative = 'Appreciative' // Max
}

export const veNari: ReputationVendor = {
  id: 2465,
  name: `Ve'nari`,
  vendors: [
    new Vendor(`Ve'nari`, true, true, [{x: 46.8, y: 41.6}]),
  ],
  expansion: 8,
  professions: {
    164: [
      new ReputationVendorRecipe(45739, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
    165: [
      new ReputationVendorRecipe(45749, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
    197: [
      new ReputationVendorRecipe(45753, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
    202: [
      new ReputationVendorRecipe(45745, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
    755: [
      new ReputationVendorRecipe(45848, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
    773: [
      new ReputationVendorRecipe(45783, 'Crafter\'s Mark II', 1, [300, 0, 1767], VeNariStanding.Cordial),
    ],
  },
  isAlly: true,
  isHorde: true,
};
