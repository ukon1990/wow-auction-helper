import {DatabaseUtil} from '../utils/database.util';

export class QueryIntegrity {

  static async getVerified(table: string, obj: object): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new DatabaseUtil().query(`describe ${table};`)
        .then((result) => {
          const validObject = {};
          let isValid = true;
          result.forEach(({Field, Null, Type}) => {
            if (Field === 'timestamp') {
              return;
            }
            if (!obj[Field] && Null === 'NO') {
              console.log('FIELD', Field);
              isValid = false;
              return;
            }
            validObject[Field] = obj[Field];
          });
          resolve(isValid ? validObject : undefined);
        })
        .catch(() =>
          reject('Could not verify DB integrity'));
    });
  }
}
