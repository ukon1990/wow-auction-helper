import {ColumnDescription} from './column-description';

export class RowClickEvent<T> {
  constructor(public column: ColumnDescription, public row: T) {
  }
}
