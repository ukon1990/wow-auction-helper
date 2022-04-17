import {ColumnDescription} from '@shared/models';

export class RowClickEvent<T> {
  constructor(public column: ColumnDescription, public row: T) {
  }
}