import {
  Watchlist,
  WatchlistGroup
} from './watchlist';
import { Recipe } from '../crafting/recipe';

export const defaultWatchlist: Array<WatchlistGroup> = [
    {
      'items': [
        {
          'value': 1,
          'itemID': 154898,
          'name': 'Meaty Haunch',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152543,
          'name': 'Sand Shifter',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152545,
          'name': 'Frenzied Fangtooth',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152546,
          'name': 'Lane Snapper',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152547,
          'name': 'Great Sea Catfish',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152548,
          'name': 'Tiragarde Perch',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152549,
          'name': 'Redtail Loach',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152631,
          'name': 'Briny Flesh',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 154897,
          'name': 'Stringy Loins',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 152544,
          'name': 'Slimy Mackerel',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 154899,
          'name': 'Thick Paleo Steak',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160398,
          'name': 'Choral Honey',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160399,
          'name': 'Wild Flour',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160400,
          'name': 'Foosaka',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160709,
          'name': 'Fresh Potato',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160710,
          'name': 'Wild Berries',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160711,
          'name': 'Aromatic Fish Oil',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 160712,
          'name': 'Powdered Sugar',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1,
          'itemID': 163782,
          'name': 'Cursed Haunch',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154887,
          'name': 'Loa Loaf',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154881,
          'name': 'Kul Tiramisu',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154883,
          'name': 'Ravenberry Tarts',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154884,
          'name': 'Swamp Fish \'n Chips',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154885,
          'name': 'Mon\'Dazi',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154886,
          'name': 'Spiced Snapper',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154882,
          'name': 'Honey-Glazed Haunches',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154888,
          'name': 'Sailor\'s Pie',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154889,
          'name': 'Grilled Catfish',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154891,
          'name': 'Seasoned Loins',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 156525,
          'name': 'Galley Banquet',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 156526,
          'name': 'Bountiful Captain\'s Feast',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163781,
          'name': 'Heartsbane Hexwurst',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Cooking',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 154169,
          'name': 'Shimmerscale Diving Helmet',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152542,
          'name': 'Hardened Tempest Hide',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154139,
          'name': 'Coarse Leather Treads',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154140,
          'name': 'Coarse Leather Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154141,
          'name': 'Coarse Leather Helm',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154142,
          'name': 'Coarse Leather Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154143,
          'name': 'Coarse Leather Pauldrons',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154144,
          'name': 'Coarse Leather Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154145,
          'name': 'Coarse Leather Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154146,
          'name': 'Shimmerscale Vest',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154147,
          'name': 'Shimmerscale Treads',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154148,
          'name': 'Shimmerscale Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154149,
          'name': 'Shimmerscale Helm',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154150,
          'name': 'Shimmerscale Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154151,
          'name': 'Shimmerscale Pauldrons',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154152,
          'name': 'Shimmerscale Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154153,
          'name': 'Shimmerscale Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154159,
          'name': 'Recurve Bow of the Strands',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154160,
          'name': 'Shimmerscale Striker',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154161,
          'name': 'Coarse Leather Cestus',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154162,
          'name': 'Mistscale Knuckles',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154163,
          'name': 'Hardened Tempest Knuckles',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154166,
          'name': 'Coarse Leather Barding',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154167,
          'name': 'Drums of the Maelstrom',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154168,
          'name': 'Shimmerscale Diving Suit',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154138,
          'name': 'Coarse Leather Vest',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159884,
          'name': 'Honorable Combatant\'s Leather Treads',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159885,
          'name': 'Honorable Combatant\'s Leather Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159886,
          'name': 'Honorable Combatant\'s Leather Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159887,
          'name': 'Honorable Combatant\'s Leather Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159888,
          'name': 'Honorable Combatant\'s Leather Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159889,
          'name': 'Honorable Combatant\'s Mail Treads',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159890,
          'name': 'Honorable Combatant\'s Mail Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159891,
          'name': 'Honorable Combatant\'s Mail Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159892,
          'name': 'Honorable Combatant\'s Mail Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159893,
          'name': 'Honorable Combatant\'s Mail Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159896,
          'name': 'Honorable Combatant\'s Bow',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161946,
          'name': 'Hardened Tempest Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161947,
          'name': 'Hardened Tempest Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161961,
          'name': 'Mistscale Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161962,
          'name': 'Mistscale Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162116,
          'name': 'Tempest Hide Pouch',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162122,
          'name': 'Amber Rallying Horn',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162468,
          'name': 'Emblazoned Tempest Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162470,
          'name': 'Emblazoned Tempest Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162472,
          'name': 'Emblazoned Mistscale Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162474,
          'name': 'Emblazoned Mistscale Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162489,
          'name': 'Imbued Mistscale Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162490,
          'name': 'Imbued Mistscale Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162493,
          'name': 'Imbued Tempest Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162494,
          'name': 'Imbued Tempest Leggings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'matchSaleRate': 0,
      'matchDailySold': 0,
      'name': '[BFA] Leatherworking',
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 158212,
          'name': 'Crow\'s Nest Scope',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152830,
          'name': 'Magnetic Discombobulator',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153487,
          'name': 'Organic Discombobulation Grenade',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153490,
          'name': 'F.R.I.E.D.',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153494,
          'name': 'Thermo-Accelerated Plague Spreader',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153506,
          'name': 'Finely-Tuned Stormsteel Destroyer',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153510,
          'name': 'Interdimensional Companion Repository',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153512,
          'name': 'XA-1000 Surface Skimmer',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153573,
          'name': 'Electroshock Mount Motivator',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153591,
          'name': 'Belt Enchant: Holographic Horror Projector',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153592,
          'name': 'Belt Enchant: Personal Space Amplifier',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153597,
          'name': 'Deployable Attire Rearranger',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158203,
          'name': 'Incendiary Ammunition',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152837,
          'name': 'Precision Attitude Adjuster',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158327,
          'name': 'Monelite Scope of Alacrity',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158377,
          'name': 'Frost-Laced Ammunition',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158380,
          'name': 'Magical Intrusion Dampener',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159829,
          'name': 'Belt Enchant: Miniaturized Plasma Shield',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159936,
          'name': 'Honorable Combatant\'s Stormsteel Destroyer',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159937,
          'name': 'Honorable Combatant\'s Discombobulator',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160488,
          'name': 'AZ3-R1-T3 Synthetic Specs',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160489,
          'name': 'AZ3-R1-T3 Gearspun Goggles',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160490,
          'name': 'AZ3-R1-T3 Bionic Bifocals',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160491,
          'name': 'AZ3-R1-T3 Orthogonal Optics',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161134,
          'name': 'Mecha-Mogul Mk2',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162107,
          'name': 'Makeshift Azerite Detector',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162111,
          'name': 'Monelite Fish Finder',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'matchSaleRate': 0,
      'matchDailySold': 0,
      'name': '[BFA] Engineering',
      'hide': false
    },
    {
      'items': [
        {
          'value': 16000000,
          'itemID': 152877,
          'name': 'Veiled Crystal',
          'compareTo': 'buyout',
          'targetType': 'gold',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 1160000,
          'itemID': 152876,
          'name': 'Umbra Shard',
          'compareTo': 'buyout',
          'targetType': 'gold',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153479,
          'name': 'Enchant Weapon - Torrent of Elements',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153430,
          'name': 'Enchant Gloves - Kul Tiran Herbalism',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153434,
          'name': 'Enchant Gloves - Kul Tiran Skinning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153435,
          'name': 'Enchant Gloves - Kul Tiran Surveying',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153436,
          'name': 'Enchant Bracers - Swift Hearthing',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153437,
          'name': 'Enchant Gloves - Kul Tiran Crafting',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153438,
          'name': 'Enchant Ring - Seal of Critical Strike',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153439,
          'name': 'Enchant Ring - Seal of Haste',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153440,
          'name': 'Enchant Ring - Seal of Mastery',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153441,
          'name': 'Enchant Ring - Seal of Versatility',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153442,
          'name': 'Enchant Ring - Pact of Critical Strike',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153443,
          'name': 'Enchant Ring - Pact of Haste',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153444,
          'name': 'Enchant Ring - Pact of Mastery',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153445,
          'name': 'Enchant Ring - Pact of Versatility',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153476,
          'name': 'Enchant Weapon - Coastal Surge',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153478,
          'name': 'Enchant Weapon - Siphoning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153431,
          'name': 'Enchant Gloves - Kul Tiran Mining',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153480,
          'name': 'Enchant Weapon - Gale-Force Striking',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159464,
          'name': 'Enchant Gloves - Zandalari Herbalism',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159466,
          'name': 'Enchant Gloves - Zandalari Mining',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159467,
          'name': 'Enchant Gloves - Zandalari Skinning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159468,
          'name': 'Enchant Gloves - Zandalari Surveying',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159469,
          'name': 'Enchant Bracers - Swift Hearthing',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159471,
          'name': 'Enchant Gloves - Zandalari Crafting',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159785,
          'name': 'Enchant Weapon - Deadly Navigation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159786,
          'name': 'Enchant Weapon - Quick Navigation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159787,
          'name': 'Enchant Weapon - Masterful Navigation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159788,
          'name': 'Enchant Weapon - Versatile Navigation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159789,
          'name': 'Enchant Weapon - Stalwart Navigation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160328,
          'name': 'Enchant Bracers - Safe Hearthing',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 160330,
          'name': 'Enchant Bracers - Cooled Hearthing',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162110,
          'name': 'Disenchanting Rod',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 150000,
          'itemID': 152875,
          'name': 'Gloom Dust',
          'compareTo': 'buyout',
          'targetType': 'gold',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Enchanting',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 70,
          'itemID': 152512,
          'name': 'Monelite Ore',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152513,
          'name': 'Platinum Ore',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152579,
          'name': 'Storm Silver Ore',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152505,
          'name': 'Riverbud',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152506,
          'name': 'Star Moss',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152507,
          'name': 'Akunda\'s Bite',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152508,
          'name': 'Winter\'s Kiss',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152509,
          'name': 'Siren\'s Pollen',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152510,
          'name': 'Anchor Weed',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152511,
          'name': 'Sea Stalk',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152541,
          'name': 'Coarse Leather',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 152542,
          'name': 'Hardened Tempest Hide',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153050,
          'name': 'Shimmerscale',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153051,
          'name': 'Mistscale',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Leathers, Ores & herbs',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 159853,
          'name': 'Honorable Combatant\'s Cutlass',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152802,
          'name': 'Monel-Hardened Breastplate',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152804,
          'name': 'Monel-Hardened Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152805,
          'name': 'Monel-Hardened Helm',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152806,
          'name': 'Monel-Hardened Greaves',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152807,
          'name': 'Monel-Hardened Pauldrons',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152808,
          'name': 'Monel-Hardened Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152809,
          'name': 'Monel-Hardened Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152812,
          'name': 'Monel-Hardened Hoofplates',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152813,
          'name': 'Monel-Hardened Stirrups',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152818,
          'name': 'Monel-Hardened Shield',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152819,
          'name': 'Stormsteel Shield',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152827,
          'name': 'Monel-Hardened Cutlass',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152828,
          'name': 'Monel-Hardened Claymore',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152831,
          'name': 'Monel-Hardened Deckpounder',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152832,
          'name': 'Monel-Hardened Shanker',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152833,
          'name': 'Monel-Hardened Polearm',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152834,
          'name': 'Stormsteel Spear',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152835,
          'name': 'Stormsteel Dagger',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159826,
          'name': 'Monelite Skeleton Key',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159851,
          'name': 'Honorable Combatant\'s Shield',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152803,
          'name': 'Monel-Hardened Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159855,
          'name': 'Honorable Combatant\'s Deckpounder',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159857,
          'name': 'Honorable Combatant\'s Shanker',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159858,
          'name': 'Honorable Combatant\'s Polearm',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159860,
          'name': 'Honorable Combatant\'s Plate Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159861,
          'name': 'Honorable Combatant\'s Plate Gauntlets',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159863,
          'name': 'Honorable Combatant\'s Plate Greaves',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159865,
          'name': 'Honorable Combatant\'s Plate Waistguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159866,
          'name': 'Honorable Combatant\'s Plate Armguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161888,
          'name': 'Stormsteel Legguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161889,
          'name': 'Stormsteel Girdle',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162109,
          'name': 'Storm Silver Spurs',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162115,
          'name': 'Magnetic Mining Pick',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162120,
          'name': 'Platinum Whetstone',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162464,
          'name': 'Emblazoned Stormsteel Legguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162466,
          'name': 'Emblazoned Stormsteel Girdle',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162491,
          'name': 'Imbued Stormsteel Legguards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162492,
          'name': 'Imbued Stormsteel Girdle',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162652,
          'name': 'Honorable Combatant\'s Spellblade',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162655,
          'name': 'Stormsteel Saber',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163964,
          'name': 'Barbaric Iron Hauberk',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'matchSaleRate': 0,
      'matchDailySold': 0,
      'name': '[BFA] Blacksmithing',
      'hide': false
    },
    {
      'items': [
        {
          'value': 70,
          'itemID': 153705,
          'name': 'Kyanite',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 154123,
          'name': 'Amberblaze',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 154124,
          'name': 'Laribole',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 154121,
          'name': 'Scarlet Diamond',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 154120,
          'name': 'Owlseye',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153700,
          'name': 'Golden Beryl',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 154122,
          'name': 'Tidal Amethyst',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153706,
          'name': 'Kraken\'s Eye',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153701,
          'name': 'Rubellite',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153703,
          'name': 'Solstone',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153704,
          'name': 'Viridium',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 70,
          'itemID': 153702,
          'name': 'Kubiline',
          'compareTo': 'mktPrice',
          'targetType': 'percent',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153713,
          'name': 'Masterful Kubiline',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153707,
          'name': 'Kraken\'s Eye of Strength',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153709,
          'name': 'Kraken\'s Eye of Intellect',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153710,
          'name': 'Deadly Solstone',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153711,
          'name': 'Quick Golden Beryl',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153712,
          'name': 'Versatile Kyanite',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153708,
          'name': 'Kraken\'s Eye of Agility',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153714,
          'name': 'Insightful Rubellite',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153715,
          'name': 'Straddling Viridium',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154126,
          'name': 'Deadly Amberblaze',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154127,
          'name': 'Quick Owlseye',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154128,
          'name': 'Versatile Royal Quartz',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154129,
          'name': 'Masterful Tidal Amethyst',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Gems',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 152638,
          'name': 'Flask of the Currents',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152494,
          'name': 'Coastal Healing Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152496,
          'name': 'Demitri\'s Draught of Deception',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152497,
          'name': 'Lightfoot Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152503,
          'name': 'Potion of Concealment',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152550,
          'name': 'Sea Mist Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152557,
          'name': 'Steelskin Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152559,
          'name': 'Potion of Rising Death',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152560,
          'name': 'Potion of Bursting Blood',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152561,
          'name': 'Potion of Replenishment',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152495,
          'name': 'Coastal Mana Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152639,
          'name': 'Flask of Endless Fathoms',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152640,
          'name': 'Flask of the Vast Horizon',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 152641,
          'name': 'Flask of the Undertow',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162113,
          'name': 'Potion of Herb Tracking',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162519,
          'name': 'Mystical Cauldron',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163082,
          'name': 'Coastal Rejuvenation Potion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163222,
          'name': 'Battle Potion of Intellect',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163223,
          'name': 'Battle Potion of Agility',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163224,
          'name': 'Battle Potion of Strength',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 163225,
          'name': 'Battle Potion of Stamina',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Alchemy',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 158187,
          'name': 'Ultramarine Ink',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158188,
          'name': 'Crimson Ink',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158189,
          'name': 'Viridescent Ink',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162114,
          'name': 'Crimson Ink Well',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153661,
          'name': 'Contract: Proudmoore Admiralty',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153662,
          'name': 'Contract: Order of Embers',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153663,
          'name': 'Contract: Storm\'s Wake',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153664,
          'name': 'Contract: Zandalari Empire',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153665,
          'name': 'Contract: Talanji\'s Expedition',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153666,
          'name': 'Contract: Voldunai',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153667,
          'name': 'Contract: Tortollan Seekers',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153668,
          'name': 'Contract: Champions of Azeroth',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153647,
          'name': 'Tome of the Quiet Mind',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153646,
          'name': 'Codex of the Quiet Mind',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Inscription',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 162478,
          'name': 'Emblazoned Deep Sea Breeches',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162476,
          'name': 'Emblazoned Deep Sea Gloves',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162488,
          'name': 'Imbued Deep Sea Breeches',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162487,
          'name': 'Imbued Deep Sea Gloves',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161985,
          'name': 'Embroidered Deep Sea Gloves',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 161986,
          'name': 'Embroidered Deep Sea Breeches',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159914,
          'name': 'Honorable Combatant\'s Satin Pants',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159913,
          'name': 'Honorable Combatant\'s Satin Mittens',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159917,
          'name': 'Honorable Combatant\'s Satin Cloak',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159916,
          'name': 'Honorable Combatant\'s Satin Bracers',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159915,
          'name': 'Honorable Combatant\'s Satin Belt',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159912,
          'name': 'Honorable Combatant\'s Satin Boots',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154700,
          'name': 'Embroidered Deep Sea Cloak',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154690,
          'name': 'Tidespray Linen Spaulders',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154691,
          'name': 'Tidespray Linen Belt',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154692,
          'name': 'Tidespray Linen Bracers',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154685,
          'name': 'Tidespray Linen Robe',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154686,
          'name': 'Tidespray Linen Sandals',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154687,
          'name': 'Tidespray Linen Mittens',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154697,
          'name': 'Tidespray Linen Cloak',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154688,
          'name': 'Tidespray Linen Hood',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154689,
          'name': 'Tidespray Linen Pants',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158378,
          'name': 'Embroidered Deep Sea Satin',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159792,
          'name': 'Hooked Deep Sea Net',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 159791,
          'name': 'Tidespray Linen Net',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158381,
          'name': 'Tidespray Linen Bandage',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158382,
          'name': 'Deep Sea Bandage',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154695,
          'name': 'Deep Sea Bag',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154696,
          'name': 'Embroidered Deep Sea Bag',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162108,
          'name': 'Rough-hooked Tidespray Linen',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154707,
          'name': 'Battle Flag: Spirit of Freedom',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154705,
          'name': 'Battle Flag: Rallying Swiftness',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 154706,
          'name': 'Battle Flag: Phalanx Defense',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 0,
          'itemID': 152577,
          'name': 'Deep Sea Satin',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 158378,
          'name': 'Embroidered Deep Sea Satin',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 6000,
          'itemID': 159959,
          'name': 'Nylon Thread',
          'compareTo': 'buyout',
          'targetType': 'gold',
          'criteria': 'below',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 0,
          'itemID': 152576,
          'name': 'Tidespray Linen',
          'compareTo': 'quantityTotal',
          'targetType': 'quantity',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'name': '[BFA] Tailoring',
      'matchDailySold': 0,
      'matchSaleRate': 0,
      'hide': false
    },
    {
      'items': [
        {
          'value': 110,
          'itemID': 136826,
          'name': 'Glyph of Autumnal Bloom',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 40919,
          'name': 'Glyph of the Orca',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 42459,
          'name': 'Glyph of Felguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 42751,
          'name': 'Glyph of Crittermorph',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43334,
          'name': 'Glyph of the Ursol Chameleon',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43350,
          'name': 'Glyph of Lesser Proportion',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43366,
          'name': 'Glyph of Winged Vengeance',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43369,
          'name': 'Glyph of Fire From the Heavens',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43373,
          'name': 'Glyph of Shackle Undead',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43386,
          'name': 'Glyph of the Spectral Wolf',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43394,
          'name': 'Glyph of Soulwell',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43398,
          'name': 'Glyph of Gushing Wound',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43400,
          'name': 'Glyph of Mighty Victory',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43535,
          'name': 'Glyph of the Geist',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 43551,
          'name': 'Glyph of Foul Menagerie',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 44922,
          'name': 'Glyph of Stars',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 45768,
          'name': 'Glyph of Disguise',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 45775,
          'name': 'Glyph of Deluge',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 45789,
          'name': 'Glyph of Crimson Banish',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 49084,
          'name': 'Glyph of Thunder Strike',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 77101,
          'name': 'Glyph of Shadow',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 79538,
          'name': 'Glyph of the Heavens',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 80587,
          'name': 'Glyph of Hawk Feast',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 80588,
          'name': 'Glyph of Burning Anger',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 85221,
          'name': 'Glyph of the Blazing Trail',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87277,
          'name': 'Glyph of the Val\'kyr',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87392,
          'name': 'Glyph of Shadowy Friends',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87881,
          'name': 'Glyph of Crackling Tiger Lightning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87883,
          'name': 'Glyph of Honor',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87885,
          'name': 'Glyph of Rising Tiger Kick',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 87888,
          'name': 'Glyph of Fighting Pose',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 89868,
          'name': 'Glyph of the Cheetah',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104099,
          'name': 'Glyph of the Skeleton',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104104,
          'name': 'Glyph of the Unbound Elemental',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104105,
          'name': 'Glyph of Evaporation',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104108,
          'name': 'Glyph of Pillar of Light',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104120,
          'name': 'Glyph of the Sha',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104122,
          'name': 'Glyph of Inspired Hymns',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104126,
          'name': 'Glyph of Spirit Raptors',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104127,
          'name': 'Glyph of Lingering Ancestors',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 104138,
          'name': 'Glyph of the Weaponmaster',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 118061,
          'name': 'Glyph of the Sun',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129017,
          'name': 'Glyph of Ghostly Fade',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129018,
          'name': 'Glyph of Fel Imp',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129019,
          'name': 'Glyph of Sparkles',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129020,
          'name': 'Glyph of Flash Bang',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129021,
          'name': 'Glyph of the Sentinel',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129022,
          'name': 'Glyph of Crackling Ox Lightning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129028,
          'name': 'Glyph of Fel Touched Souls',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 129029,
          'name': 'Glyph of Crackling Flames',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 136825,
          'name': 'Glyph of the Feral Chameleon',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 41100,
          'name': 'Glyph of the Luminous Charger',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137188,
          'name': 'Glyph of the Blazing Savior',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137191,
          'name': 'Glyph of the Inquisitor\'s Eye',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137238,
          'name': 'Glyph of the Trident',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137239,
          'name': 'Glyph of the Hook',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137240,
          'name': 'Glyph of the Headhunter',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137249,
          'name': 'Glyph of Arachnophobia',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137250,
          'name': 'Glyph of Nesingwary\'s Nemeses',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137267,
          'name': 'Glyph of the Goblin Anti-Grav Flare',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137269,
          'name': 'Glyph of Stellar Flare',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137274,
          'name': 'Glyph of Cracked Ice',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137287,
          'name': 'Glyph of the Spectral Raptor',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137288,
          'name': 'Glyph of Pebbles',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137289,
          'name': 'Glyph of Flickering',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 137293,
          'name': 'Glyph of the Queen',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139270,
          'name': 'Glyph of the Crimson Shell',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139271,
          'name': 'Glyph of the Chilled Shell',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139278,
          'name': 'Glyph of the Forest Path',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139288,
          'name': 'Glyph of the Dire Stable',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139289,
          'name': 'Glyph of Critterhex',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139310,
          'name': 'Glyph of the Shivarra',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139311,
          'name': 'Glyph of the Voidlord',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139312,
          'name': 'Glyph of the Observer',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139315,
          'name': 'Glyph of Wrathguard',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139338,
          'name': 'Glyph of Crackling Crane Lightning',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139339,
          'name': 'Glyph of Yu\'lon\'s Grace',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139348,
          'name': 'Glyph of Smolder',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139352,
          'name': 'Glyph of Polymorphic Proportions',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139358,
          'name': 'Glyph of Blackout',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139362,
          'name': 'Glyph of Mana Touched Souls',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139417,
          'name': 'Glyph of Fallow Wings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139435,
          'name': 'Glyph of Fel Wings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139436,
          'name': 'Glyph of Tattered Wings',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139437,
          'name': 'Glyph of Fel-Enemies',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139438,
          'name': 'Glyph of Shadow-Enemies',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 139442,
          'name': 'Glyph of Burnout',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 140630,
          'name': 'Glyph of the Doe',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 141898,
          'name': 'Glyph of Falling Thunder',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 143588,
          'name': 'Glyph of the Trusted Steed',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 143750,
          'name': 'Glyph of Twilight Bloom',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 147119,
          'name': 'Glyph of the Shadow Succubus',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 149755,
          'name': 'Glyph of Angels',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 151538,
          'name': 'Glyph of Ember Shards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 151540,
          'name': 'Glyph of Floating Shards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 151542,
          'name': 'Glyph of Fel-Touched Shards',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153031,
          'name': 'Glyph of the Lightspawn',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153033,
          'name': 'Glyph of the Voidling',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 153036,
          'name': 'Glyph of Dark Absolution',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162022,
          'name': 'Glyph of the Dolphin',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162027,
          'name': 'Glyph of the Tideskipper',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        },
        {
          'value': 110,
          'itemID': 162029,
          'name': 'Glyph of the Humble Flyer',
          'compareTo': 'craftCost',
          'targetType': 'percent',
          'criteria': 'above',
          'minCraftingProfit': 0,
          'target': null
        }
      ],
      'matchSaleRate': 0,
      'matchDailySold': 0,
      'name': 'Glyphs',
      'hide': false
    }
  ];
