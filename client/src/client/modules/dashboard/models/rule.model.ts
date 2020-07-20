import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';

export interface Rule {
  condition: ConditionEnum;
  targetValueType: TargetValueEnum;
  field: string;
  toField?: string;
  toValue: number | string | boolean;
}

export interface ItemRule {
  itemId: number;
  bonusIds?: number[];
  petSpeciesId?: number;
  rules: Rule[];
}
