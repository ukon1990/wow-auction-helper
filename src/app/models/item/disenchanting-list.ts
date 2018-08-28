/**
 * TODO: Base this off item quality and expansions if above wow classic
 */

export const itemQualities = [
  'Poor',
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary'
];

export const itemQuality = {
  1: 'Gray',
  2: 'Green',
  3: 'Blue',
  4: 'Epic',
  5: 'Legendary'
};

export const materials = [
  // Legion
  { id: 124442, quality: 4, minILVL: 800, maxILVL: 1000, yield: { iLvL: 1, min: 1, max: 1 } },
  { id: 124441, quality: 3, minILVL: 660, maxILVL: 900, yield: { iLvL: 1, min: 1, max: 1 } },
  { id: 124440, quality: 2, minILVL: 680, maxILVL: 900, yield: { iLvL: 600, min: 2, max: 4 } },
  // Warlords
  { id: 113588, quality: 4, minILVL: 630, maxILVL: 799, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 111245, quality: 3, minILVL: 505, maxILVL: 700, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 109693, quality: 2, minILVL: 494, maxILVL: 700, yield: { iLvL: 600, min: 2, max: 4 } },
  // Mists of Pandaria
  { id: 74248, quality: 4, minILVL: 420, maxILVL: 629, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 74247, quality: 3, minILVL: 430, maxILVL: 463, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 74249, quality: 2, minILVL: 364, maxILVL: 429, yield: { iLvL: 600, min: 2, max: 4 } },

  // Cataclysm
  { id: 52722, quality: 4, minILVL: 352, maxILVL: 397, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 52721, quality: 3, minILVL: 318, maxILVL: 377, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 52719, quality: 2, minILVL: 306, maxILVL: 333, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 52555, quality: 2, minILVL: 278, maxILVL: 333, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 52718, quality: 2, minILVL: 272, maxILVL: 305, yield: { iLvL: 600, min: 2, max: 4 } },
  // Wrath of the Lich King
  { id: 34057, quality: 4, minILVL: 200, maxILVL: 277, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 34052, quality: 3, minILVL: 167, maxILVL: 200, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 34055, quality: 2, minILVL: 154, maxILVL: 182, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 34056, quality: 2, minILVL: 130, maxILVL: 150, yield: { iLvL: 600, min: 2, max: 4 } },
  { id: 34054, quality: 2, minILVL: 130, maxILVL: 182, yield: { iLvL: 600, min: 2, max: 4 } },

  // The burning crusade
  // Vanilla
];
