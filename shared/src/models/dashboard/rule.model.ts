import {ConditionEnum, TargetValueEnum} from "@shared/enum";

export interface Rule {
  condition: ConditionEnum;
  targetValueType: TargetValueEnum;
  field: string;
  toField?: string;
  toValue?: number | string | boolean;
  or?: Rule[];
  isAlwaysValid?: boolean; // This is just a dummy, for itemRules with no actual rules
}