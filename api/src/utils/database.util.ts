import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';
import {environment} from '../../../client/src/environments/environment';

export class DatabaseUtil {
  private readonly connection: Connection;
  private isConnectionActive = false;

  constructor(private autoTerminate: boolean = true) {
    if (!environment.test) {
      this.connection = mysql.createConnection(DATABASE_CREDENTIALS);
    }
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (environment.test) {
        resolve([]);
        return;
      }
      this.enqueueHandshake()
        .then(() => {
          this.connection.query(query, (err: MysqlError, rows: any[]) => {
            if (this.autoTerminate) {
              this.end();
            }

            if (err) {
              console.error(err);
              reject({message: `Failed to execute the query: ${ query }`, error: err.stack});
              return;
            }

            resolve(rows);
          });
        })
        .catch((error) => {
          console.error(error);
          console.error(error);
          reject();
        });
    });
  }

  end(): void {
    if (environment.test) {
      return;
    }
    this.connection.end();
  }

  private enqueueHandshake(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.connection) {
        reject('No connection is available');
        return;
      }

      if (this.isConnectionActive) {
        resolve();
        return;
      }

      this.isConnectionActive = true;
      this.connection.connect((error) => {
        if (error) {
          this.isConnectionActive = false;
          console.error(error);
          reject({
            message: 'Could not connect to the database',
            error: 'Could not connect to the database',
            stack: error.stack
          });
          return;
        } else {
          console.log('DatabaseUtil.query -> Connected as id ' + this.connection.threadId);
          this.isConnectionActive = true;
          resolve();
        }
      });
    });
  }
}
