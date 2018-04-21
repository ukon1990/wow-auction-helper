export class ColumnDescription {
  title: string;
  dataType: string;
  key?: string;
  actions?: Array<string>;
  hideOnMobile? = false;
  customSort?: Function;
}
