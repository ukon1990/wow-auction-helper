import {ColumnDescription} from './column.description';

export class TableRowClickEvent<T = any> {
  constructor(public column: ColumnDescription, public row: T, public index: number) {
  }
}