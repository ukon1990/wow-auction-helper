import * as lua from 'luaparse';

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
  static toObject(input): object {
    const {fields} = lua.parse(input).body[0].init[0];
    return this.handleFields(fields as TableKey[]);
  }

  private static handleTableKey({key, value, type}: TableKey) {
    if (type === 'TableValue') {
      return {
        key: 'data',
        data: this.handleValue(value)
      };
    }
    return {
      key: key.value,
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

  private static handleFields(fields: TableKey[]) {
    const result = {};
    fields.forEach(field => {
      const {key, data} = this.handleTableKey(field);
      if (data) {
        result[key] = data;
      }
    });

    return result;
  }
}
