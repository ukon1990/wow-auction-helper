export class ColumnDescription {
  title: string;
  dataType: string;
  key?: string;
  actions?: Array<string>;
  hideOnMobile?: boolean;
  customSort?: Function;
  cssClass?: string;
}
