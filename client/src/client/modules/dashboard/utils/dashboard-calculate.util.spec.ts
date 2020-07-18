import {DashboardV2} from '../models/dashboard-v2.model';
import {ItemRule, Rule} from '../models/rule.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from './dashboard-calculate.util';

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
  describe('calculate', () => {
    it('With item rules', () => {
      const board: DashboardV2 = DashboardCalculateUtil.calculate(getBoard([
        {
          condition: ConditionEnum.EQUAL_TO,
          targetValueType: TargetValueEnum.NUMBER,
          field: '',
          toField: '',
        }
      ]));

      expect(board.data.length).toBe(1);
    });

    it('With board rules', () => {
    });
  });
});
