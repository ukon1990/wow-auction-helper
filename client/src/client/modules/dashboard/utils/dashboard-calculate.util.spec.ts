import {DashboardV2} from '../models/dashboard-v2.model';
import {ItemRule, Rule} from '../models/rule.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from './dashboard-calculate.util';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Auction} from '../../auction/models/auction.model';
import {columnConfig} from '../data/columns.data';

const getBoard = (rules: Rule[] = [], itemRules?: ItemRule[]) => ({
  id: 'asd-dsa',
  idParam: null,
  title: 'test',
  columns: [{
    key: 'name',
    title: 'Name',
  }, {
    key: 'buyout',
    title: 'Buyout'
  }, {
    key: 'bid',
    title: 'Bid'
  },
    columnConfig.recipe.knownROI
  ],
  rules,
  itemRules,
  data: []
} as DashboardV2);

fdescribe('DashboardCalculateUtil', () => {
  const recipe1 = new Recipe();
  recipe1.roi = 50;
  recipe1.professionId = 1;
  recipe1.cost = 40;

  const firstItem = new AuctionItem(1);
  firstItem.name = 'test';
  firstItem.bid = 3;
  firstItem.buyout = 7;
  firstItem.mktPrice = 10;
  firstItem.source.recipe.known = [recipe1];
  firstItem.auctions.push(new Auction(1, 1, 90, 50));
  firstItem.auctions.push(new Auction(1, 1, 50, 11));
  firstItem.auctions.push(new Auction(1, 1, 93, 1));
  firstItem.regionSaleRate = 0.05;

  const recipe2 = new Recipe();
  recipe2.roi = 10;
  recipe2.professionId = 33;
  recipe2.cost = 30;

  const secondItem = new AuctionItem(2);
  secondItem.name = 'test2';
  secondItem.bid = 101;
  secondItem.buyout = 99;
  secondItem.mktPrice = 99;
  secondItem.source.recipe.known = [recipe2];
  secondItem.regionSaleRate = 0.15;

  const thirdItem = new AuctionItem(3);
  thirdItem.name = 'No recipes';
  thirdItem.bid = 55;
  thirdItem.buyout = 60;
  thirdItem.mktPrice = 71;
  thirdItem.auctions.push(new Auction(2, 3, 60, 1000));
  thirdItem.regionSaleRate = 0.14;

  const auctionItems: Map<string, AuctionItem> = new Map<string, AuctionItem>();

  beforeEach(() => {
    auctionItems.clear();
    auctionItems.set('1', firstItem);
    auctionItems.set('2', secondItem);
    auctionItems.set('3', thirdItem);
  });

  describe('calculate', () => {
    describe('Board rules', () => {
      it('Basic', () => {
        const board: DashboardV2 = DashboardCalculateUtil.calculate(
          getBoard([
            {
              condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
              targetValueType: TargetValueEnum.NUMBER,
              field: 'buyout',
              toValue: 99
            }
          ]), auctionItems);

        expect(board.data.length).toBe(1);
        expect(board.data[0].buyout).toBe(secondItem.buyout);
      });

      it('Buyout vs Market value', () => {
        const board: DashboardV2 = DashboardCalculateUtil.calculate(
          getBoard([
            {
              condition: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
              targetValueType: TargetValueEnum.PERCENT,
              field: 'buyout',
              toField: 'mktPrice',
              toValue: 70
            }
          ]), auctionItems);

        expect(board.data.length).toBe(1);
        expect(board.data[0].buyout).toBe(firstItem.buyout);
      });

      it('Name contains', () => {
        const board: DashboardV2 = DashboardCalculateUtil.calculate(
          getBoard([
            {
              condition: ConditionEnum.CONTAINS,
              targetValueType: TargetValueEnum.TEXT,
              field: 'name',
              toValue: 'test'
            }
          ]), auctionItems);

        expect(board.data.length).toBe(2);
      });

      it('Name is', () => {
        const board: DashboardV2 = DashboardCalculateUtil.calculate(
          getBoard([
            {
              condition: ConditionEnum.EQUAL_TO,
              targetValueType: TargetValueEnum.TEXT,
              field: 'name',
              toValue: 'test'
            }
          ]), auctionItems);

        expect(board.data.length).toBe(1);
      });


      it('Can handle saleRate percent', () => {
        const board: DashboardV2 = DashboardCalculateUtil.calculate(
          getBoard([
            {
              condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
              targetValueType: TargetValueEnum.PERCENT,
              field: 'regionSaleRate',
              toValue: 15
            }
          ]), auctionItems);

        expect(board.data.length).toBe(1);
      });

      describe('Crafting', () => {
        fit('ROI > value', () => {
          const board: DashboardV2 = getBoard([
            {
              condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
              targetValueType: TargetValueEnum.PERCENT,
              field: 'buyout',
              toValue: 100,
              toField: columnConfig.recipe.knownCost.key
            }
          ]);
          board.columns.push(columnConfig.recipe.knownCost);
          DashboardCalculateUtil.calculate(board, auctionItems);

          expect(board.data.length).toBe(1);
          expect(board.data[0].buyout).toBe(secondItem.buyout);
        });

        it('Can handle multiple ranks', () => {

          const board: DashboardV2 = getBoard([
            {
              condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
              targetValueType: TargetValueEnum.PERCENT,
              field: 'buyout',
              toValue: 1,
              toField: columnConfig.recipe.knownCost.key
            },
            {
              condition: ConditionEnum.EQUAL_TO,
              targetValueType: TargetValueEnum.NUMBER,
              field: 'itemID',
              toValue: 4,
            }
          ]);
          board.columns = [
            {
              key: 'name',
              title: 'Name',
              dataType: 'name'
            },
            {
              key: 'buyout',
              title: 'Lowest buyout',
              dataType: 'gold'
            },
            {
              key: 'source.recipe.[known].rank',
              title: 'Rank',
              dataType: 'number'
            },
            {
              key: '0.95*buyout-source.recipe.[known].cost',
              title: 'Profit',
              dataType: 'gold'
            },
            {
              key: '0.95*buyout/source.recipe.[known].cost',
              title: 'ROI %',
              dataType: 'percent'
            },
            {
              key: 'source.recipe.[known].cost',
              title: 'Cost',
              dataType: 'gold'
            },
            {
              key: 'regionSaleRate',
              title: 'Sale rate',
              dataType: 'percent'
            },
            {
              key: 'itemLevel',
              title: 'ILvL',
              dataType: 'number'
            },
            {
              title: 'In cart',
              dataType: 'cart-recipe-count',
              options: {
                idName: 'recipeId'
              }
            }
          ];
          board.sortRule = {
            field: columnConfig.recipe.knownRank.key,
            sortDesc: true
          };

          board.columns.push(columnConfig.recipe.knownRank);
          board.columns.push(columnConfig.recipe.knownCost);
          const rank1: Recipe = new Recipe();
          rank1.id = 100;
          rank1.rank = 1;
          rank1.cost = 3;
          const rank2: Recipe = new Recipe();
          rank2.id = 101;
          rank2.rank = 2;
          rank2.cost = 2;
          const rank3: Recipe = new Recipe();
          rank3.id = 102;
          rank3.rank = 3;
          rank2.cost = 1;


          const ai = new AuctionItem(4);
          ai.name = 'Ranked recipes';
          ai.bid = 55;
          ai.buyout = 60;
          ai.mktPrice = 71;
          ai.auctions.push(new Auction(2, 3, 60, 1000));
          ai.regionSaleRate = 0.14;
          ai.source.recipe.known = [rank1, rank2, rank3];
          auctionItems.set('4', ai);

          DashboardCalculateUtil.calculate(board, auctionItems);

          expect(board.data.length).toBe(3);
          expect(board.data[0][columnConfig.recipe.knownRank.key]).toBe(3);
          expect(board.data[0][columnConfig.recipe.knownCost.key]).toBe(rank3.cost);
          expect(board.data[0].recipeId).toBe(rank3.id);
          expect(board.data[1][columnConfig.recipe.knownRank.key]).toBe(2);
          expect(board.data[1][columnConfig.recipe.knownCost.key]).toBe(rank2.cost);
          expect(board.data[1].recipeId).toBe(rank2.id);
          expect(board.data[2][columnConfig.recipe.knownRank.key]).toBe(1);
          expect(board.data[2][columnConfig.recipe.knownCost.key]).toBe(rank1.cost);
          expect(board.data[2].recipeId).toBe(rank1.id);
        });

        it('Profession and ROI > value', () => {
          const board: DashboardV2 =
            getBoard([
              {
                condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
                targetValueType: TargetValueEnum.PERCENT,
                field: 'buyout',
                toValue: 100,
                toField: columnConfig.recipe.knownCost.key
              }, {
                condition: ConditionEnum.EQUAL_TO,
                targetValueType: TargetValueEnum.NUMBER,
                field: columnConfig.recipe.knownProfession.key,
                toValue: 33
              }
            ]);
          board.columns.push(columnConfig.recipe.knownCost);
          DashboardCalculateUtil.calculate(board, auctionItems);

          expect(board.data.length).toBe(1);
          expect(board.data[0][columnConfig.recipe.knownCost.key])
            .toBe(recipe2.cost);
        });
      });

      it('Where toField is null', () => {
        const board: DashboardV2 = getBoard([
          {
            condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
            targetValueType: TargetValueEnum.NUMBER,
            field: 'buyout',
            toValue: 1,
            toField: null
          }
        ]);
        board.columns.push(columnConfig.recipe.knownCost);
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(3);
      });

      it('Where toField is gold', () => {
        const board: DashboardV2 = getBoard([
          {
            condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
            targetValueType: TargetValueEnum.GOLD,
            field: 'buyout',
            toValue: '50c'
          }
        ]);
        board.columns.push(columnConfig.recipe.knownCost);
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(2);
      });

      it('Where toField is gold with 0c', () => {
        const board: DashboardV2 = getBoard([
          {
            condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
            targetValueType: TargetValueEnum.GOLD,
            field: 'buyout',
            toValue: '0c'
          }
        ]);
        board.columns.push(columnConfig.recipe.knownCost);
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(3);
      });
    });

    describe('Item rules', () => {
      it('Only include these items', () => {
        const board: DashboardV2 = getBoard([], [
          {
            itemId: 1,
            rules: [{
              condition: ConditionEnum.GREATER_THAN,
              targetValueType: TargetValueEnum.NUMBER,
              field: 'buyout',
              toValue: 1
            }]
          }
        ]);
        board.onlyItemsWithRules = true;
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(1);
        expect(board.data[0]['buyout'])
          .toBe(firstItem.buyout);
      });

      it('With board rules', () => {
        const board: DashboardV2 = getBoard([], [
          {
            itemId: 1,
            rules: [{
              condition: ConditionEnum.GREATER_THAN,
              targetValueType: TargetValueEnum.NUMBER,
              field: 'source.recipe.known.0.roi',
              toValue: 50
            }]
          }
        ]);
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(2);
        expect(board.data[0]['buyout'])
          .toBe(secondItem.buyout);
      });
    });
  });

  describe('Sort rule', () => {
    const rules: Rule[] = [
      {
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: 'buyout',
        toValue: 1,
      }
    ];
    it('Can sort ascending', () => {
      const board: DashboardV2 = getBoard(rules);
      board.sortRule = {
        field: 'buyout',
        sortDesc: false
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data[0].buyout).toBe(firstItem.buyout);
      expect(board.data[2].buyout).toBe(secondItem.buyout);
    });

    it('Can sort descending', () => {
      const board: DashboardV2 = getBoard(rules);
      board.sortRule = {
        field: 'buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data[2].buyout).toBe(firstItem.buyout);
      expect(board.data[0].buyout).toBe(secondItem.buyout);
    });
  });

  describe('Can do math on fields', () => {
    it('Can add', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.GOLD,
          field: 'buyout',
          toValue: 1
        }
      ]);
      board.columns.push({
        key: 'bid+buyout',
        title: 'Bid + Buyout',
        dataType: 'number'
      });
      board.sortRule = {
        field: 'buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data[0]['bid+buyout']).toBe(200);
    });

    it('Can divide', () => {
      const board: DashboardV2 = getBoard([{
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.PERCENT,
        field: columnConfig.recipe.knownROIPercent.key,
        toValue: 1
      }
      ]);
      board.columns.push(columnConfig.recipe.knownROIPercent);
      board.sortRule = {
        field: 'buyout',
        sortDesc: false
      };
      DashboardCalculateUtil.calculate(board, auctionItems);
      expect(board.data[0][columnConfig.recipe.knownROIPercent.key]).toBe(0.175);
    });

    it('Can subtract', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.GOLD,
          field: 'buyout',
          toValue: 1
        }
      ]);
      board.columns.push({
        key: 'bid-buyout',
        title: 'Bid - Buyout',
        dataType: 'number'
      });
      board.sortRule = {
        field: 'buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data[0]['bid-buyout']).toBe(2);
    });

    describe('Multiple fields', function () {
      it('Containing only fields', () => {
        const {buyout, source, regionSaleRate} = secondItem;
        const result = DashboardCalculateUtil.getValueFromField('regionSaleRate*buyout+source.recipe.[known].cost', secondItem);
        expect(result).toBe(regionSaleRate * buyout - source.recipe.known[0].cost);
      });

      it('Containing a numeric value in the field', () => {
        const {buyout, source} = secondItem;
        console.log('Testen start');
        const result = DashboardCalculateUtil.getValueFromField('0.95*buyout+source.recipe.[known].cost', secondItem);
        console.log('Testen slutt');
        expect(result).toBe(0.95 * buyout - source.recipe.known[0].cost);
      });
    });
  });

  describe('Can loop over array fields', () => {
    it('Left side', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.NUMBER,
          field: '[auctions].buyout',
          toValue: 51
        }
      ]);
      board.columns.push({
        key: '[auctions].buyout',
        title: 'Buyout for auc',
        dataType: 'gold'
      });
      board.sortRule = {
        field: '[auctions].buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data.length).toBe(3);
      expect(board.data[0]['[auctions].buyout']).toBe(firstItem.auctions[2].buyout);
    });

    it('Right side', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.EQUAL_TO,
          targetValueType: TargetValueEnum.NUMBER,
          field: 'buyout',
          toField: '[auctions].buyout'
        }
      ]);
      board.columns.push({
        key: '[auctions].buyout',
        title: 'Buyout for auc',
        dataType: 'gold'
      });
      board.sortRule = {
        field: '[auctions].buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data.length).toBe(1);
      expect(board.data[0]['[auctions].buyout']).toBe(thirdItem.auctions[0].buyout);
    });
  });

  xdescribe('Can combine item and recipe name', () => {
    it('Should not combine transmutes', () => {
      // TODO: Remember take non english locales into consideration
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.NUMBER,
          field: 'buyout',
          toValue: 1,
        }
      ]);
      board.columns.push(columnConfig.recipe.knownName);
      const recipe = new Recipe();
      recipe.name = 'Transmute: Mithril to Truesilver';
      recipe.itemID = 2;

      const item = new AuctionItem(2);
      item.name = 'Truesilver';
      item.buyout = 10;
      item.source.recipe.known = [recipe];

      const map = new Map<string, AuctionItem>();
      map.set('2', item);

      DashboardCalculateUtil.calculate(board, map);
      expect(board.data[0][columnConfig.recipe.knownName.key])
        .toBe(recipe.name);
    });

    it('Should combine bonus id items', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.NUMBER,
          field: 'buyout',
          toValue: 1,
        }
      ]);
      board.columns.push(columnConfig.recipe.knownName);
      const recipe = new Recipe();
      recipe.name = 'Uncanny';
      recipe.itemID = 2;

      const item = new AuctionItem(2);
      item.name = 'Uncanny of the Quickblade';
      item.bonusIds = [1];
      item.buyout = 10;
      item.source.recipe.known = [recipe];

      const map = new Map<string, AuctionItem>();
      map.set('2', item);

      DashboardCalculateUtil.calculate(board, map);
      expect(board.data[0][columnConfig.recipe.knownName.key])
        .toBe('Transmute: True silver');
    });

    it('Enchants should have the slot type first', () => {
      // Enchant Ring - Accord of haste
    });
  });
});
