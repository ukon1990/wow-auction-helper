import {DashboardV2} from '../models/dashboard-v2.model';
import {DashboardMigrationUtil, OldGroups} from './dashboard-migration.util';

fdescribe('DashboardMigrationUtil', () => {
  const exampleSource: OldGroups = {
    groups: [
      {
        items: [
          {
            value: 70,
            itemID: 153050,
            name: 'Shimmerscale',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 100,
            itemID: 153050,
            name: 'Shimmerscale',
            compareTo: 'craftingCost',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 153051,
            name: 'Mistscale',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          }
        ],
        name: '[BFA] Leathers, Ores & herbs',
        matchDailySold: 0,
        matchSaleRate: 0
      },
      {
        items: [
          {
            value: 70,
            itemID: 153705,
            name: 'Kyanite',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 154123,
            name: 'Amberblaze',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 110,
            itemID: 154128,
            name: 'Versatile Royal Quartz',
            compareTo: 'craftCost',
            targetType: 'percent',
            criteria: 'above',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 110,
            itemID: 154129,
            name: 'Masterful Tidal Amethyst',
            compareTo: 'craftCost',
            targetType: 'percent',
            criteria: 'above',
            minCraftingProfit: 0,
            target: null
          }
        ],
        name: '[BFA] Gems',
        matchDailySold: 0,
        matchSaleRate: 0
      },
      {
        items: [
          {
            value: 0,
            itemID: 71718,
            name: 'Swift Shorestrider',
            compareTo: 'quantityTotal',
            targetType: 'quantity',
            criteria: 'above',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 110,
            itemID: 34060,
            name: 'Flying Machine',
            compareTo: 'craftCost',
            targetType: 'percent',
            criteria: 'above',
            minCraftingProfit: 0,
            target: null
          }
        ],
        matchSaleRate: 0,
        matchDailySold: 0,
        name: 'Mounts',
        hide: true
      },
      {
        items: [
          {
            value: 70,
            itemID: 23572,
            name: 'Primal Nether',
            compareTo: 'regionSaleAvg',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 20815,
            name: 'Jeweler\'s Kit',
            compareTo: 'regionSaleAvg',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 35562,
            name: 'Bear Flank',
            compareTo: 'regionSaleAvg',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 43614,
            name: 'Broken Wrath Elixir',
            compareTo: 'regionSaleAvg',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 70,
            itemID: 43620,
            name: 'Broken Spellpower Elixir',
            compareTo: 'regionSaleAvg',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          }
        ],
        name: '[TBC] Farmable',
        matchDailySold: 100,
        matchSaleRate: 20,
        hide: true
      },
      {
        items: [
          {
            value: 50,
            itemID: 7078,
            name: 'Essence of Fire',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
          {
            value: 50,
            itemID: 723,
            name: 'Goretusk Liver',
            compareTo: 'mktPrice',
            targetType: 'percent',
            criteria: 'below',
            minCraftingProfit: 0,
            target: null
          },
        ],
        matchSaleRate: 20,
        matchDailySold: 100,
        name: '[Classic] Farmable',
        hide: true
      }
    ]
  };
  let result: DashboardV2[] = [];

  beforeAll(() => {
    result = DashboardMigrationUtil.migrate(exampleSource);
  });

  it('Can collect groups', () => {
    expect(result.length).toBe(5);
  });

  it('Can add basic rules based on the sale rate and daily sold avg setting', () => {
    expect(result[3].rules.length).toBe(2);
  });

  it('Can set item rules', () => {
    console.log('boards', result);
    expect(result[0].itemRules.length).toBe(2);
  });

  it('If there are multiple rules for one item, then it should be set as an "or" rule', () => {
    expect(result[0].itemRules[0].rules[0].or.length).toBe(1);
  });
});
