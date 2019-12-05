import {DatabaseUtil} from '../utils/database.util';

export class QueryIntegrity {

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
            if (this.isNullButRequiered(obj, Field, Null) || this.isTypeMissMatch(obj[Field], Type)) {
              isValid = false;
            } else {
              validObject[Field] = obj[Field];
            }
          });
          resolve(isValid ? validObject : undefined);
        })
        .catch(() =>
          reject('Could not verify DB integrity'));
    });
  }

  private static isNullButRequiered(obj: object, Field, Null) {
    return !obj[Field] && Null === 'NO';
  }

  private static isTypeMissMatch(objElement: any, Type: any) {
    return false;
  }
}
