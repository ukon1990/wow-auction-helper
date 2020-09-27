import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {LogRepository} from './repository';
import {LogEntry} from '../models/log-entry.model';
import {GlobalStatus, SQLProcess, TableSize} from './model';

const crypto = require('crypto');

export class LogService {
  detail;
  userId: string;

  constructor(public event: APIGatewayEvent, private conn: DatabaseUtil) {
    try {
      if (this.event.requestContext && this.event.requestContext['identity']) {
        this.detail = this.event.requestContext['identity'];
      } else if (this.event['detail']) {
        this.detail = this.event['detail'];
      }
      this.userId = this.generateId();
    } catch (error) {}
  }

  handleS3AccessLog(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const params = this.detail.requestParameters,
        isNotAWSAPI = !TextUtil.contains(this.detail.userAgent, 'AWS_Lambda');
      const path = params.key.split('/');

      const requestData = {
        bucketName: params.bucketName,
        type: path[0],
        region: path[1],
        ahId: isNaN(path[2]) ? null : path[2],
        fileName: path[path.length - 1],
        ipObfuscated: this.userId,
        userAgent: this.detail.userAgent,
      };

      if (isNotAWSAPI && (requestData.ahId || requestData.type === 'tsm')) {
        const sql = LogRepository.s3Event(requestData);
        this.conn
          .query(sql)
          .then(() => {
            resolve();
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      } else {
        resolve();
      }
    });
  }

  clientEvent(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const entry: LogEntry = JSON.parse(this.event.body);
        if (!entry.userId) {
          entry.userId = this.userId;
        }
        new DatabaseUtil()
          .query(LogRepository.userEvent(entry))
          .then(r =>
            resolve(r))
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  deleteClient(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        const entry: LogEntry = JSON.parse(this.event.body);
        if (!entry.userId) {
          entry.userId = this.userId;
        }
        this.conn
          .query(LogRepository.deleteUser(entry))
          .then(() => resolve(entry))
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  private generateId() {
    return crypto.createHash('sha256')
      .update(this.detail.sourceIp || this.detail.sourceIPAddress)
      .digest('base64');
  }

  getLog() {
    // connection.query(LogQuery)
  }

  getCurrentQueries(): Promise<SQLProcess[]> {
    return this.conn.query(LogRepository.processList);
  }

  getTableSize(): Promise<TableSize[]> {
    return this.conn.query(LogRepository.tableSize);
  }

  getGlobalStatus(): Promise<GlobalStatus> {
    return new Promise<any>((resolve, reject) => {
      this.conn.query(LogRepository.globalStatus)
        .then((status: { Variable_name: string, Value: any }[]) => {
          const result = {};

          status.forEach(s => {
            result[s.Variable_name] = isNaN(s.Value) ? s.Value : +s.Value;
          });

          resolve(result);
        })
        .catch(reject);
    });
  }
}
