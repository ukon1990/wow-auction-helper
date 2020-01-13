import {ArrayUtil, EmptyUtil} from '@ukon1990/js-utilities';
import {safeifyString} from './string.util';

export class QueryUtil<T> {

  static unixTimestamp(timestamp): string {
    return `UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp)}`;
  }

  constructor(private table: string, private setTimestamp = true) {
  }

  update(id: number, object: T): string {
    const cv = this.getColumnsAndValues(object);
    let query = `UPDATE ${this.table} SET `;

    query += cv.columns
      .map((column, index) =>
        `${column} = ${cv.values[index]}`)
      .join(',');

    if (this.setTimestamp) {
      query += ',timestamp = CURRENT_TIMESTAMP';
    }

    return `${query} WHERE id = ${id};`;
  }

  insert(object: T): string {
    const cv = this.getColumnsAndValues(object);
    return `INSERT INTO ${this.table
    }(${
      cv.columns.join(',')
    }${this.setTimestamp ? ',timestamp' : ''}) VALUES(${cv.values.join(',')
    }${this.setTimestamp ? ',CURRENT_TIMESTAMP' : ''});`;
  }

  /* Need to have the same column count */
  multiInsert(list: T[]): string {
    let queries = '';
    for (let i = 0, l = list.length; i < l; ++i) {
      const cv = this.getColumnsAndValues(list[i]);
      if (!i) {
        queries = `INSERT INTO ${this.table
        }(${
          cv.columns.join(',')
        }) VALUES(${cv.values.join(',')})`;
      } else {
        queries += `,(${cv.values.join(',')})`;
      }
    }
    return queries + ';';
  }

  private getColumnsAndValues(object: T) {
    const columns = [];
    const values = [];

    Object.keys(object)
      .forEach(k => {
        const value = this.getSQLFriendlyString(object[k]);
        if (object[k] !== undefined && typeof value !== 'boolean') {
          columns.push(k);
          values.push(value);
        }
      });
    return {
      columns, values
    };
  }

  private getSQLFriendlyString(value: any): string | number | boolean {
    const type = typeof value;
    switch (type) {
      case 'number':
        return value;
      case 'boolean':
        return value ? 1 : 0;
      case 'object':
        return this.handleObject(value);
      default:
        return `"${safeifyString(value)}"`;
    }
  }

  private handleObject(value: any) {
    if (EmptyUtil.isNullOrUndefined(value)) {
      return 'null';
    }
    /* TODO: Until we get a better handler for arrays :)
    if (ArrayUtil.isArray(value)) {
      return false;
    }*/
    if (value.getDate) {
      return +value;
    }
    return `"${safeifyString(JSON.stringify(value))}"`;
  }
}
