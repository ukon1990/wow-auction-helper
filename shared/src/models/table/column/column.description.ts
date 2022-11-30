import {RowAction} from '../../../models';
import {ColumnTypeEnum} from '../../../enum';

export interface ColumnDescription {
  title: string;
  dataType: ColumnTypeEnum | string;
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