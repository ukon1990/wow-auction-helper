// import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';

const mysql = require('mysql');
export class DatabaseUtil {
  connection;

  constructor() {
    this.connection = mysql.createConnection(DATABASE_CREDENTIALS);
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.connection.query(query, (error, rows: any[]) => {
        this.connection.end();

        if (error) {
          reject({error: error, query: query});
          return;
        }

        resolve(rows);
      });
    });
  }
}
