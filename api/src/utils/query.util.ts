import {EmptyUtil} from '@ukon1990/js-utilities';
import {safeifyString} from './string.util';
import {S3} from 'aws-sdk';

export class RDSQueryUtil<T> {
  static getSQLTimestamp(timestamp: S3.LastModified) {
    // example format: 2020-09-28 07:03:20
    const month = timestamp.getMonth() + 1;
    const withZero = (value: number) => value > 10 ? value : '0' + value;
    return `${timestamp.getFullYear()}-${withZero(month)}-${withZero(timestamp.getDate())} ${
      withZero(timestamp.getHours())}:${withZero(timestamp.getMinutes())}:${withZero(timestamp.getSeconds())}`;
  }

  static unixTimestamp(timestamp): string {
    return `UNIX_TIMESTAMP(timestamp) > ${+new Date(timestamp) / 1000}`;
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

  insert(object: T, terminate: boolean = true): string {
    const cv = this.getColumnsAndValues(object);
    return `INSERT INTO ${this.table
    }(${
      cv.columns.join(',')
    }${this.setTimestamp ? ',timestamp' : ''}) VALUES(${cv.values.join(',')
    }${this.setTimestamp ? ',CURRENT_TIMESTAMP' : ''})${terminate ? ';' : ' '}`;
  }

  insertOrUpdate(object: T): string {
    const clone = {...object};
    delete clone['id'];
    const cv = this.getColumnsAndValues(clone);
    const insert = this.insert(object, false);
    return insert + ` ON DUPLICATE KEY UPDATE ${
      cv.columns.map((column, index) => `${column} = ${cv.values[index]}`).join(',')
    }`;
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

export class NoSQLQueryUtil {

  static update(table: string, input: any) {
    const {
      attributeValues,
      updateExpression,
      expressionAttributeNames
    } = this.getAttributeValues(input);

    return {
      TableName: table,
      Key: {
        id: input.id
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: attributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'UPDATED_NEW'
    };
  }

  private static getAttributeValues<T>(input: T) {
    const attributeValues = {
      ':lastModified': +new Date()
    };
    const updateExpression = [
    ];
    const expressionAttributeNames = {
    };

    if (!input['lastModified']) {
      updateExpression.push('lastModified = :lastModified');
    }

    Object.keys(input).forEach(key => {
      if (key === 'id') {
        return;
      }
      attributeValues[`:${key}`] = input[key];
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
    });
    return {
      attributeValues,
      updateExpression: `set ${updateExpression.join(', ')}`,
      expressionAttributeNames,
    };
  }
}
