import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';

export interface Rule {
  condition: ConditionEnum;
  targetValueType: TargetValueEnum;
  field: string;
  toField: string;
}

export interface ItemRule extends Rule {
  itemId: number;
  bonusIds: number[];
  petSpeciesId: number;
}
