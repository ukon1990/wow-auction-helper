import {RowAction} from '../../../models';

export interface ColumnDescription {
  title: string;
  dataType: string;
  key?: string;
  actions?: string[] | RowAction[];
  hideOnMobile?: boolean;
  canNotSort?: boolean;
  customSort?: Function;
  cssClass?: string;
  options?: {
    idName?: string;
    noIcon?: boolean;
    tooltip?: string;
    tooltipType?: string;
    onModelChange?: Function;
  };
}