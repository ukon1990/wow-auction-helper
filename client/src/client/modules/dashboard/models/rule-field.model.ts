import {ColumnDescription} from '@shared/models';

export interface RuleFieldGroup {
  name: string;
  options: RuleField[];
}

export interface RuleField {
  key: string;
  name: string;
  defaultType: string;
  column?: ColumnDescription;
}