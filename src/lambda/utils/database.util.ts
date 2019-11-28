import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';
import {environment} from '../../environments/environment';

export class DatabaseUtil {
  private connection: Connection;

  constructor() {
    if (environment.test) {
      this.connection = mysql.createConnection(DATABASE_CREDENTIALS);
    }
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (environment.test) {
        resolve([]);
        return;
      }
      this.connection.connect((error) => {
        if (error) {
          reject({
            message: 'Could not connect to the database',
            error: 'Could not connect to the database',
            stack: error.stack
          });
          return;
        }

        console.log('DatabaseUtil.query -> Connected as id ' + this.connection.threadId);
        this.connection.query(query, (err: MysqlError, rows: any[]) => {
          this.connection.end();

          if (err) {
            reject({message: 'Failed to execute the query', error: err.stack});
            return;
          }

          resolve(rows);
        });
      });
    });
  }
}
