import {APIGatewayEvent} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {LogRepository} from './repository';
import {LogEntry} from '../models/log-entry.model';
import {S3Handler} from '../handlers/s3.handler';
import {ListObjectsV2Output} from 'aws-sdk/clients/s3';
import {RDSQueryUtil} from '../utils/query.util';
import {LogDynamoRepository} from './dynamo.repository.model';
import {GlobalStatus, SQLProcess, TableSize} from '@shared/models';

const crypto = require('crypto');

export class LogService {
  detail;
  userId: string;
  private repository: LogDynamoRepository;

  constructor(public event: APIGatewayEvent, private conn: DatabaseUtil) {
    this.repository = new LogDynamoRepository();
    try {
      if (this.event.requestContext && this.event.requestContext['identity']) {
        this.detail = this.event.requestContext['identity'];
      } else if (this.event['detail']) {
        this.detail = this.event['detail'];
      }
      this.userId = this.generateId();
    } catch (error) {
    }
  }

  processAccessLogs(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const insertStatsStart = +new Date();
      let completed = 0, total = 0;
      const s3 = new S3Handler();
      s3.list('wah-data-eu-se', 'logg/inserts/', 2000)
        .then(async (objects: ListObjectsV2Output) => {
          total = objects.Contents.length;

          if (!total) {
            console.log('There are no inserts to process', total);
            resolve();
            return;
          }


          objects.Contents
            .sort((a, b) =>
              +new Date(a.LastModified) - +new Date(b.LastModified));

          console.log(`Preparing to process ${total} files`);

          const list = [];
          await Promise.all(
            objects.Contents.map(object =>
              new Promise<void>((res, rej) => {
                s3.getAndDecompress(objects.Name, object.Key)
                  .then(async (entry: any) => {
                    list.push({
                      ...entry,
                      timestamp: RDSQueryUtil.getSQLTimestamp(object.LastModified)
                    });
                    completed++;
                    res();
                  })
                  .catch(error => {
                    rej(error);
                    console.error(`StatsService.insertStats.Contents`, error);
                  });
              })))
            .catch(console.error);
          console.log(`Done fetching files ${completed} / ${total} in ${+new Date() - insertStatsStart} ms`);

          this.conn.query(LogRepository.s3Event(list))
            .then(async () => {
              console.log('Successfully inserted access events');
              await Promise.all(
                objects.Contents.map(object =>
                  s3.deleteObject(objects.Name, object.Key)
                    .catch(console.error)))
                .catch(console.error);
              console.log(`Done deleting files`);

              console.log(
                `Completed ${completed} / ${total} in ${+new Date() - insertStatsStart} ms`);
              this.conn.end();
              resolve();
            })
            .catch(err => {
              console.error(err);
              this.conn.end();
              reject(err);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  handleS3AccessLog(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
      /*
      I do not think that this is needed after the DynamoDB swap



      const params = this.detail.requestParameters,
        isNotAWSAPI = !TextUtil.contains(this.detail.userAgent, 'AWS_Lambda');
      const path = params.key.split('/');

      const requestData = {
        bucket: params.bucketName,
        type: path[0],
        region: path[1],
        ahId: isNaN(path[2]) ? null : path[2],
        fileName: path[path.length - 1],
        userId: this.userId,
        isMe: 0,
        userAgent: this.detail.userAgent,
      };

      if (isNotAWSAPI &&
        !requestData.ahId &&
        TextUtil.contains(requestData.bucket, 'wah-data-') &&
        requestData.fileName !== 'status.json.gz'
      ) {
      */
      /*
        We just want to update if it is a realm slug that was
        requested (meaning update on client init or update check)
      *//*
        new RealmService().updateLastRequestedWithRegionAndSlug(
          requestData.region, requestData.fileName.replace('.json.gz', ''), +new Date())
          .then(resolve)
          .catch(reject);
      } else {
        resolve();
      }
    */
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