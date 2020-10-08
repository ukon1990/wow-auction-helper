import {ColumnDescription} from '../../table/models/column-description';

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
