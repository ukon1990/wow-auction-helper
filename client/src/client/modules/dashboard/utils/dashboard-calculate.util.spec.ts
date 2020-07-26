import {DashboardV2} from '../models/dashboard-v2.model';
import {ItemRule, Rule} from '../models/rule.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from './dashboard-calculate.util';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Auction} from '../../auction/models/auction.model';

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
  }, {
    key: 'source.recipe.known.0.roi',
    title: 'roi'
  }],
  rules,
  itemRules,
  data: []
} as DashboardV2);

fdescribe('DashboardCalculateUtil', () => {
  const recipe1 = new Recipe();
  recipe1.roi = 50;
  recipe1.professionId = 1;
  recipe1.cost = 7 * 4;

  const firstItem = new AuctionItem(1);
  firstItem.name = 'test';
  firstItem.bid = 3;
  firstItem.buyout = 7;
  firstItem.mktPrice = 10;
  firstItem.source.recipe.known = [recipe1];
  firstItem.auctions.push(new Auction(1, 1, 90, 50));
  firstItem.auctions.push(new Auction(1, 1, 50, 11));
  firstItem.auctions.push(new Auction(1, 1, 93, 1));

  const recipe2 = new Recipe();
  recipe2.roi = 10;
  recipe2.professionId = 33;
  recipe2.cost = 99 * 2;

  const secondItem = new AuctionItem(2);
  secondItem.name = 'test2';
  secondItem.bid = 101;
  secondItem.buyout = 99;
  secondItem.mktPrice = 99;
  secondItem.source.recipe.known = [recipe2];

  const auctionItems: Map<string, AuctionItem> = new Map<string, AuctionItem>();

  beforeAll(() => {
    // recipeMap.set(32, []);
    auctionItems.set('1', firstItem);
    auctionItems.set('2', secondItem);
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
              toValue: .7
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

      describe('Crafting', () => {
        it('ROI > value', () => {
          const board: DashboardV2 = DashboardCalculateUtil.calculate(
            getBoard([
              {
                condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
                targetValueType: TargetValueEnum.PERCENT,
                field: 'source.recipe.known.0.cost',
                toValue: 1,
                toField: 'buyout'
              }
            ]), auctionItems);

          expect(board.data.length).toBe(2);
          expect(board.data[0].buyout).toBe(firstItem.buyout);
        });

        it('Profession and ROI > value', () => {
          const board: DashboardV2 = DashboardCalculateUtil.calculate(
            getBoard([
              {
                condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
                targetValueType: TargetValueEnum.PERCENT,
                field: 'source.recipe.known.0.cost',
                toValue: 1.15,
                toField: 'buyout'
              },
              {
                condition: ConditionEnum.EQUAL_TO,
                targetValueType: TargetValueEnum.NUMBER,
                field: 'source.recipe.known.0.professionId',
                toValue: 1
              }
            ]), auctionItems);

          expect(board.data.length).toBe(1);
          expect(board.data[0]['source.recipe.known.0.roi'])
            .toBe(firstItem.source.recipe.known[0].roi);
        });
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
              field: 'buyout',
              toValue: 50
            }]
          }
        ]);
        DashboardCalculateUtil.calculate(board, auctionItems);

        expect(board.data.length).toBe(1);
        expect(board.data[0]['buyout'])
          .toBe(secondItem.buyout);
      });
    });
  });

  describe('Sort rule', () => {
    it('Can sort ascending', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.PERCENT,
          field: 'source.recipe.known.0.cost',
          toValue: 1,
          toField: 'buyout'
        }
      ]);
      board.sortRule = {
        field: 'buyout',
        sortDesc: false
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data[0].buyout).toBe(firstItem.buyout);
    });

    it('Can sort descending', () => {
      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.PERCENT,
          field: 'source.recipe.known.0.cost',
          toValue: 1,
          toField: 'buyout'
        }
      ]);
      board.sortRule = {
        field: 'buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

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
      console.log('xxx', board);
      expect(board.data[0]['bid-buyout']).toBe(2);
    });
  });

  xdescribe('Can loop over array fields', () => {
    it('Loop', () => {

      const board: DashboardV2 = getBoard([
        {
          condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
          targetValueType: TargetValueEnum.PERCENT,
          field: 'source.[auctions].buyout',
          toValue: 51
        }
      ]);
      board.sortRule = {
        field: 'source.[auctions].buyout',
        sortDesc: true
      };
      DashboardCalculateUtil.calculate(board, auctionItems);

      expect(board.data.length).toBe(2);
      expect(board.data[0]['source.[auctions].buyout']).toBe(secondItem.auctions[2].buyout);
    });
  });
});
