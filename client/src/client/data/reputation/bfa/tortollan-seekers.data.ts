import {ReputationVendor, ReputationVendorRecipe, Vendor} from '../../../models/reputation.model';

export const tortollanSeekers: ReputationVendor = {
  id: 2163,
  name: 'Tortollan Seekers',
  expansion: 7,
  vendors: [
    new Vendor('Collector Kojo', true, true, [
      {
        zone: 'Zuldazar'
      }
    ], 134345),
    new Vendor('Collector Kojo', true, true, [
      {
        zone: 'Stormsong Valley'
      }
    ], 135793),
  ],
  professions: {
    171: [
      new ReputationVendorRecipe(38802, 'Endless Tincture of Renewed Combat', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38805, 'Siren\'s Alchemist Stone', 3, [14000000, 0, 0], 'Revered'),
    ],
    185: [
      // TODO: Missing!?!?! new ReputationVendorRecipe(38805, 'Bountiful Captains Feast', 2, [11000000, 0, 0], 'Honored'),
      // TODO: Missing!?!?! new ReputationVendorRecipe(38805, 'Bountiful Captains Feast', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39630, 'Galley Banquet', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39621, 'Grilled Catfish', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39642, 'Seasoned Loins', 3, [14000000, 0, 0], 'Revered'),
    ],
    333: [
      new ReputationVendorRecipe(38855, 'Seal of Critical Strike', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38864, 'Seal of Versatility', 3, [14000000, 0, 0], 'Revered'),
    ],
    773: [
      new ReputationVendorRecipe(38963, 'Contract: Champions of Azeroth', 2, [11000000, 0, 0], 'Friendly'),
      new ReputationVendorRecipe(38960, 'Contract: Tortollan Seekers', 2, [11000000, 0, 0], 'Friendly'),
      new ReputationVendorRecipe(38940, 'Codex of the Quiet Mind', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38984, 'Darkmoon Card of War', 3, [14000000, 0, 0], 'Revered'),
      // TODO: Missing!! new ReputationVendorRecipe(38940, 'Inked Vessel of Robust Regeneration', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38975, 'Inscribed Vessel of Mysticism', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(38982, 'Tome of the Quiet Mind', 3, [14000000, 0, 0], 'Revered'),
      new ReputationVendorRecipe(39717, 'Glyph of the Dolphin', 0, [14000000, 0, 0], 'Revered'),
    ],
    197: [
      new ReputationVendorRecipe(39071, 'Codex of the Quiet Mind', 2, [14000000, 0, 0], 'Revered'),
    ]
  },
  isAlly: true,
  isHorde: true
};
