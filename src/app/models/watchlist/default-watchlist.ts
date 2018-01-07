import {
  Watchlist,


  WatchlistGroup
} from './watchlist';
import { Recipe } from '../crafting/recipe';

export const defaultWatchlist: Array<WatchlistGroup> = [{
  'items': [{
    'itemID': 124103,
    'name': 'Foxflower',
    'compareTo': 'buyout',
    'value': 200000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124105,
    'name': 'Starlight Rose',
    'compareTo': 'buyout',
    'value': 400000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124104,
    'name': 'Fjarnskaggl',
    'compareTo': 'buyout',
    'value': 150000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124106,
    'name': 'Felwort',
    'compareTo': 'buyout',
    'value': 1000000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124101,
    'name': 'Aethril',
    'compareTo': 'buyout',
    'value': 60000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124102,
    'name': 'Dreamleaf',
    'compareTo': 'buyout',
    'value': 80000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Legion herbs'
},
{
  'items': [{
    'itemID': 123918,
    'name': 'Leystone Ore',
    'compareTo': 'buyout',
    'value': 80000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 123919,
    'name': 'Felslate',
    'compareTo': 'buyout',
    'value': 200000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Legion ores'
},
{
  'items': [{
    'itemID': 124442,
    'name': 'Chaos Crystal',
    'compareTo': 'buyout',
    'value': 1500000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124440,
    'name': 'Arkhana',
    'compareTo': 'buyout',
    'value': 200000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124441,
    'name': 'Leylight Shard',
    'compareTo': 'buyout',
    'value': 600000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Enchanting materials'
},
{
  'items': [{
    'itemID': 130220,
    'name': 'Quick Dawnlight',
    'compareTo': 'buyout',
    'value': 10000000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 130222,
    'name': 'Masterful Shadowruby',
    'compareTo': 'buyout',
    'value': 10000000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 130219,
    'name': 'Deadly Eye of Prophecy',
    'compareTo': 'buyout',
    'value': 10000000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 130221,
    'name': 'Versatile Maelstrom Sapphire',
    'compareTo': 'buyout',
    'value': 3000000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Legion Gems'
},
{
  'items': [{
    'itemID': 133607,
    'name': 'Silver Mackerel',
    'compareTo': 'buyout',
    'value': 50000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'undefined'
},
{
  'items': [{
    'itemID': 133607,
    'name': 'Silver Mackerel',
    'compareTo': 'buyout',
    'value': 50000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124107,
    'name': 'Cursed Queenfish',
    'compareTo': 'buyout',
    'value': 50000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124109,
    'name': 'Highmountain Salmon',
    'compareTo': 'buyout',
    'value': 100000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124108,
    'name': 'Mossgill Perch',
    'compareTo': 'buyout',
    'value': 10000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124110,
    'name': 'Stormray',
    'compareTo': 'buyout',
    'value': 150000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124111,
    'name': 'Runescale Koi',
    'compareTo': 'buyout',
    'value': 150000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124112,
    'name': 'Black Barracuda',
    'compareTo': 'buyout',
    'value': 100000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Legion fish'
},
{
  'items': [{
    'itemID': 124115,
    'name': 'Stormscale',
    'compareTo': 'buyout',
    'value': 80000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  },
  {
    'itemID': 124113,
    'name': 'Stonehide Leather',
    'compareTo': 'buyout',
    'value': 100000,
    'target': 0,
    'targetType': 'gold',
    'criteria': 'below',
    'minCraftingProfit': 0
  }],
  'name': 'Legion leather'
}];
