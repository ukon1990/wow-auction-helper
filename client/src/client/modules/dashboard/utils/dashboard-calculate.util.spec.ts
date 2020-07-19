import {DashboardV2} from '../models/dashboard-v2.model';
import {ItemRule, Rule} from '../models/rule.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from './dashboard-calculate.util';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionItem} from '../../auction/models/auction-item.model';

const getBoard = (rules: Rule[] = [], itemRules?: ItemRule[]) => ({
  id: 1,
  idParam: null,
  title: 'test',
  tsmShoppingString: '',
  columns: [{
    key: 'name',
    title: 'Name',
  }, {
    key: 'buyout',
    title: 'Buyout'
  }],
  rules,
  itemRules,
  data: []
} as DashboardV2);

fdescribe('DashboardCalculateUtil', () => {
  const firstItem = new AuctionItem(1);
  firstItem.name = 'test';
  firstItem.buyout = 7;
  firstItem.mktPrice = 10;

  const secondItem = new AuctionItem(2);
  secondItem.name = 'test2';
  secondItem.buyout = 99;
  secondItem.mktPrice = 99;

  const auctionItems: Map<number, AuctionItem> = new Map<number, AuctionItem>();
  const recipeMap = new Map<number, Recipe>();

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
          ]), auctionItems, recipeMap);

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
          ]), auctionItems, recipeMap);

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
          ]), auctionItems, recipeMap);

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
          ]), auctionItems, recipeMap);

        expect(board.data.length).toBe(1);
      });

      it('Crafting cost > x', () => {
      });
    });

    describe('Item rules', () => {
      it('With board rules', () => {
      });
    });
  });
});
