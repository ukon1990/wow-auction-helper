import {ColumnDescription} from '@shared/models';

export class TableUtil {
  static onInputChange(row, column: ColumnDescription, value): void {
    row[column.key] = value;
    if (column.options && column.options.onModelChange) {
      column.options.onModelChange(row, column.key, value);
    }
  }

  static getItemID(item: any, column: ColumnDescription, idName: string): number {
    if (column && column.options && column.options.idName) {
      return item[column.options.idName];
    }
    return item[idName] ? item[idName] : item.itemID;
  }
}