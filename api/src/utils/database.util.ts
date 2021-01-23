import * as mysql from 'mysql';
import {DATABASE_CREDENTIALS, RDS_CREDENTIALS} from '../secrets';
import {Connection, MysqlError} from 'mysql';

import {environment} from '../../../client/src/environments/environment';
import {RDSDataService, SecretsManager} from 'aws-sdk';
import {AWSError} from 'aws-sdk/lib/error';

export class DatabaseUtil {
  private readonly connection: RDSDataService;
  private isConnectionActive = false;
  private client = new SecretsManager({
    region: 'eu-west-1'
  });

  constructor(private autoTerminate: boolean = true) {
    if (!environment.test) {
      // this.connection = mysql.createConnection(DATABASE_CREDENTIALS);
      this.connection = new RDSDataService({
        region: 'eu-west-1'
      });
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
          this.connection.executeStatement({
            ...RDS_CREDENTIALS,
            sql: query,
          }, (err: AWSError, data: RDSDataService.Types.ExecuteStatementResponse) => {
            /*
            if (this.autoTerminate) {
              this.end();
            }
            */

            if (err) {
              const msg = this.handleSQLError(err);
              reject({message: `Failed to execute the query: ${query}`, error: msg.stack});
              return;
            }

            resolve(data.records);
          });
        })
        .catch((error) => {
          this.handleSQLError(error);
          reject();
        });
    });
  }

  private handleSQLError(err: AWSError) {
    const msg = {
      ...err
    };
    /*
    if (msg) {
      msg.sql = msg.sql.slice(0, 256);
    }
    */

    if (msg.message) {
      msg.message = msg.message.slice(0, 256);
    }

    if (msg.stack) {
      msg.stack = msg.stack.slice(0, 256);
    }
    console.error(msg);
    return msg;
  }

  end(): void {
    /* TODO: Not needed for Aurora RDS Serverless
    if (environment.test) {
      return;
    }
    console.log('Closing the DB connection on thread on:' + this.connection.threadId);
    this.connection.end();
    */
  }

  enqueueHandshake(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
      /*
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
      this.connection.connect((error) => {
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
    */
    });
  }
}
