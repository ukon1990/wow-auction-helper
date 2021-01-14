import * as lua from 'luaparse';
import {ErrorReport} from '../../../utils/error-report.util';
import {Report} from '../../../utils/report.util';

class LuaKey {
  type: string;
  value: any;
  raw: string;
}

class LuaValue {
  type: string;
  value?: any;
  raw?: string;
  fields?: TableKey[];
}

class TableKey {
  key: LuaKey;
  type: string;
  value: LuaValue;
}

export class LuaUtil {
  static toObject(input): unknown {
    try {
      const parsed = lua.parse(input);
      Report.debug('LuaUtil.toObject.parsed', parsed);
      const {fields} = parsed.body[0].init[0];

      return this.handleFields(fields as TableKey[]);
    } catch (error) {
      ErrorReport.sendError('LuaUtil.toObject', error);
      return undefined;
    }
  }

  private static handleTableKey({key, value, type}: TableKey) {
    if (type === 'TableValue') {
      return {
        key: 'data',
        type: 'array',
        data: this.handleValue(value)
      };
    }
    return {
      key: key.value,
      type: 'object',
      data: this.handleValue(value)
    };
  }

  private static handleValue({raw, type, value, fields}: LuaValue) {
    switch (type) {
      case 'NumericLiteral':
        return value;
      case 'StringLiteral':
        return value;
      case 'TableKey':
        return this.handleTableKey(value);
      case 'TableConstructorExpression':
        return this.handleFields(fields);
      default:
        break;
    }
  }

  private static handleFields(fields: TableKey[]): unknown {
    const result = {};
    if (!fields) {
      return result;
    }

    fields.forEach(field => {
      const {key, data, type} = this.handleTableKey(field);
      if (data) {
        switch (type) {
          case 'object':
            result[key] = data;
            break;
          case 'array':
            if (!result[key]) {
              result[key] = [];
            }
            result[key].push(data);
            break;
        }
      }
    });

    return result;
  }
}
