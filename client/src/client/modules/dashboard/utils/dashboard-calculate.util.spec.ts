import {DashboardV2} from '../models/dashboard-v2.model';
import {ItemRule, Rule} from '../models/rule.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from './dashboard-calculate.util';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';

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
  firstItem.buyout = 7;
  firstItem.mktPrice = 10;
  firstItem.source.recipe.known = [recipe1];

  const recipe2 = new Recipe();
  recipe2.roi = 10;
  recipe2.professionId = 33;
  recipe2.cost = 99 * 2;

  const secondItem = new AuctionItem(2);
  secondItem.name = 'test2';
  secondItem.buyout = 99;
  secondItem.mktPrice = 99;
  secondItem.source.recipe.known = [recipe2];

  const auctionItems: Map<number, AuctionItem> = new Map<number, AuctionItem>();

  beforeAll(() => {
    // recipeMap.set(32, []);
    auctionItems.set(1, firstItem);
    auctionItems.set(2, secondItem);
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
});
