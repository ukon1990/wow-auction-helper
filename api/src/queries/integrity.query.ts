import {DatabaseUtil} from '../utils/database.util';
import {TextUtil} from '@ukon1990/js-utilities';

export class QueryIntegrity {
  private static contains: Function = TextUtil.contains;

  static async getVerified(table: string, obj: object): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new DatabaseUtil().query(`describe ${table};`)
        .then((result) => {
          const validObject = {};
          let isValid = true;
          result.forEach(({Field, Null, Type}) => {
            if (!isValid || Field === 'timestamp') {
              return;
            }
            if (this.isNullButRequired(obj, Field, Null) || !this.isTypeMatch(obj[Field], Type)) {
              console.error(`Datatype missmatch for ${Field} = ${obj[Field]} of type it should be `,
                Type, 'but was ', typeof obj[Field], this.contains(Type, 'tinyint'),
                this.isNullButRequired(obj, Field, Null), !this.isTypeMatch(obj[Field], Type));
              isValid = false;
            } else if (obj[Field]) {
              // We only wish to return a field if it has data
              validObject[Field] = obj[Field];
            }
          });
          console.log('getVerified', Object.keys(result).length, Object.keys(validObject).length);
          resolve(isValid ? validObject : undefined);
        })
        .catch(() =>
          reject('Could not verify DB integrity'));
    });
  }

  private static isNullButRequired(obj: object, Field, Null) {
    return obj[Field] === undefined && Null === 'NO';
  }

  private static isTypeMatch(parameter: any, Type: any) {
    let isMatch = false;
    if (!parameter) {
      return true;
    }

    switch (typeof parameter) {
      case 'number':
        isMatch = !this.contains(Type, 'tinyint') && this.contains(Type, 'int');
        break;
      case 'string':
        isMatch = this.contains(Type, 'char') || this.contains(Type, 'text');
        break;
      case 'boolean':
        isMatch = this.contains(Type, 'tinyint');
        break;
      case 'object':
        isMatch = this.contains(Type, 'text');
        break;
    }
    return isMatch;
  }
}
