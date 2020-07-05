import {RuleTypes} from '../types/enum';

export interface Rule {
  comparable: RuleTypes;
  field: string;
}
