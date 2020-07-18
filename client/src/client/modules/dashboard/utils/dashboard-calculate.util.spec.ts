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
  columns: [],
  rules,
  itemRules,
  data: []
} as DashboardV2);

fdescribe('DashboardCalculateUtil', () => {
  const firstItem = new AuctionItem(1);

  const secondItem = new AuctionItem(2);

  const auctionItems: AuctionItem[] = [
    firstItem, secondItem
  ];
  const recipeMap = new Map<number, Recipe>();

  beforeAll(() => {
    // recipeMap.set(32, []);
  });

  describe('calculate', () => {
    it('With item rules', () => {
      const board: DashboardV2 = DashboardCalculateUtil.calculate(
        getBoard([
          {
            condition: ConditionEnum.EQUAL_TO,
            targetValueType: TargetValueEnum.NUMBER,
            field: '',
            toField: '',
          }
        ]), auctionItems, recipeMap);

      expect(board.data.length).toBe(1);
    });

    it('With board rules', () => {
    });
  });
});
