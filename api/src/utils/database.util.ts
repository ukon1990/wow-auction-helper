import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';
import {environment} from '../../../client/src/environments/environment';

interface Credentials {
  database: string;
  host: string;
  user: string;
  password?: string;
  port?: number;
}

export class DatabaseUtil {
  private readonly connection: Connection;
  private isConnectionActive = false;

  constructor(private autoTerminate: boolean = true, isReadOnly = false, credentialsOverride?: Connection) {
    const credentials: Credentials = credentialsOverride ||
      (isReadOnly ? DATABASE_CREDENTIALS.READ : DATABASE_CREDENTIALS.ADMIN);
    if (!environment.test) {
      this.connection = mysql.createConnection(credentials);
    }
  }

  query(query: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (environment.test) {
        resolve([]);
        return;
      }

      if (!query || !query.length) {
        reject({
          message: 'Query is empty'
        });
        return;
      }

      this.enqueueHandshake()
        .then(() => {
          this.connection.query(query, (err: MysqlError, rows: any[]) => {
            if (this.autoTerminate) {
              this.end();
            }

            if (err) {
              const msg = this.handleSQLError(err);
              reject(msg);
              return;
            }

            resolve(rows);
          });
        })
        .catch((error) => {
          this.handleSQLError(error);
          reject(error);
        });
    });
  }

  private handleSQLError(err) {
    const msg = {
      ...err
    };
    if (msg.sql) {
      msg.sql = msg.sql.slice(0, 64);
    }

    if (msg.message) {
      msg.message = msg.message.slice(0, 64);
    }

    if (msg.stack) {
      msg.stack = msg.stack.slice(0, 64);
    }
    console.error(msg);
    return msg;
  }

  end(): void {
    if (environment.test) {
      return;
    }
    console.log('Closing the DB connection on thread on:' + this.connection.threadId);
    this.connection.end();
  }

  private connect(connection: Connection = this.connection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      connection.connect((error) => {
        if (error) {
          this.isConnectionActive = false;
          const msg = 'Could not connect to the database';
          console.error(msg, error);
          reject({
            message: msg,
            error: msg,
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

  enqueueHandshake(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.connection) {
        console.error('No connection is available');
        reject('No connection is available');
        return;
      }
      const isAuthenticated = this.connection.state === 'authenticated';

      // console.log('Connection status', this.connection.state);

      if (this.isConnectionActive && isAuthenticated) {
        resolve();
        return;
      }

      this.isConnectionActive = true;
      return this.connect()
        .then(() => resolve())
        .catch(reject);
    });
  }
}
