import {ColumnDescription} from '../../table/models/column-description';

export interface RuleField {
  key: string;
  name: string;
  column: ColumnDescription;
}
