import {DefaultDashboardSettings} from './default-dashboard-settings.model';
import {ItemRule, Rule} from './rule.model';
import {ColumnDescription} from '../../table/models/column-description';

export interface DashboardV2 {
  id: string; // UUID type id?
  idParam: string; // The name of the id param for the table -> No longer needed?
  title: string;
  columns: ColumnDescription[];
  isDisabled?: boolean;
  onlyItemsWithRules?: boolean;
  sortRule?: {
    field: string;
    sortDesc: boolean
  };
  rules: Rule[];
  itemRules?: ItemRule[];

  tsmShoppingString?: string;
  message?: string;
  data: any[];

  createdBy?: string;
  createdById?: string;
  lastModified?: number;
}
