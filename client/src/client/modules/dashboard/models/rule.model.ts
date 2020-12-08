import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';

export interface Rule {
  condition: ConditionEnum;
  targetValueType: TargetValueEnum;
  field: string;
  toField?: string;
  toValue?: number | string | boolean;
  or?: Rule[];
  isAlwaysValid?: boolean; // This is just a dummy, for itemRules with no actual rules
}

export interface ItemRule {
  itemId: number;
  bonusIds?: number[];
  petSpeciesId?: number;
  rules: Rule[];
}
