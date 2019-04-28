import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';

export class DatabaseUtil {
  private connection: Connection;

  constructor() {
    this.connection = mysql.createConnection(DATABASE_CREDENTIALS);
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.connection.connect((error) => {
        if (error) {
          reject({
            message: 'Could not connect to the database',
            error: 'Could not connect to the database',
            stack: error.stack
          });
          return;
        }

        console.log('connected as id ' + this.connection.threadId);

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
