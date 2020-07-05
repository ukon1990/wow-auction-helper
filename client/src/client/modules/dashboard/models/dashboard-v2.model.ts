import {ColumnDescription} from '../../table/models/column-description';
import {DefaultDashboardSettings} from './default-dashboard-settings.model';

export interface DashboardV2 {
  idParam: string;
  title: string;
  tsmShoppingString: string;
  columns: ColumnDescription[];
  data: any[];
  message: string;

  isCrafting: boolean;
  isDisabled: boolean;
  settings?: DefaultDashboardSettings;
  rules: any[];
}
