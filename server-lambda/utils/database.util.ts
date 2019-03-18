import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';

export class DatabaseUtil {
  connection: Connection;

  constructor(query?: string) {
    this.connection = mysql.createConnection(DATABASE_CREDENTIALS);

    if (query) {
      this.query(query);
    }
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.connection.query(query, (error: MysqlError, rows: any[]) => {
        this.connection.end();

        if (error) {
          reject(error);
          return;
        }

        resolve(rows);
      });
    });
  }
}
