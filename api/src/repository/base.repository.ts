import {DeleteItemOutput, DocumentClient, QueryOutput} from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk';
import {NoSQLQueryUtil} from '../utils/query.util';
import {AuthorizationUtil} from '../utils/authorization.util';
import {DashboardV2} from '../../../client/src/client/modules/dashboard/models/dashboard-v2.model';
import {DynamoDbReturnValue} from "../enums/dynamo-db-return-value.enum";

export abstract class BaseRepository<T> {
  protected client: DocumentClient;

  protected constructor(protected table: string) {
    AWS.config.update({
      region: process.env.AWS_REGION || 'eu-west-1', // environment.region
    });
    this.client = new DocumentClient();
  }

  abstract add(data: T): Promise<T>;

  abstract getById(id: string | number): Promise<T>;

  abstract getAllAfterTimestamp(timestamp: number): Promise<T[]>;


  protected scan(params): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.client.scan(params, (error: AWSError, data: QueryOutput) => {
        if (error) {
          reject(error);
          return;
        }
        const items: any[] = data.Items;
        resolve(items);
      });
    });
  }

  protected query(params): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.client.query(params,
        (error: AWSError, data: QueryOutput) => {
          if (error) {
            reject(error);
            return;
          }
          const items: any[] = data.Items;
          resolve(items);
        });
    });
  }

  protected put(data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.client.put({
        TableName: this.table,
        Item: data
      }, (error: AWSError) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });
  }

  deleteOlderThan(id: string | number, lastModified?: number): Promise<DeleteItemOutput> {
    return new Promise<DeleteItemOutput>((resolve, reject) => {
      const params = {
        TableName: this.table,
        Key: {
          id,
          lastModified
        },
        ConditionExpression: 'id = :id AND lastModified <= :lastModified',
        ExpressionAttributeValues: {
          ':id': id,
          ':lastModified': lastModified
        }
      };
      console.log('params', params);

      this.client.delete(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  delete(id: string | number, sortKey?: string, sortKeyValue?: number): Promise<DeleteItemOutput> {
    return new Promise<DeleteItemOutput>((resolve, reject) => {
      const params = {
        TableName: this.table,
        Key: {
          id
        },
        ConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id
        }
      };

      if (sortKey && sortKeyValue) {
        params.Key[sortKey] = sortKeyValue;
        params.ExpressionAttributeValues[`:${sortKey}`] = sortKeyValue;
        params.ConditionExpression = `${params.ConditionExpression} AND ${sortKey} = :${sortKey}`;
      }
      this.client.delete(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  updateEntry(id: string | number, entry: T | any, updateLastModified = true, returnValues?: DynamoDbReturnValue): Promise<T> {
    return new Promise((resolve, reject) => {
      this.client.update(NoSQLQueryUtil.update(this.table, {
          id,
          ...entry,
        }, updateLastModified, returnValues),
        (error, data) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data.Attributes as T);
        });
    });
  }

  updateMultiple(entries: T[] | any[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      Promise.all(
        // tslint:disable-next-line:no-string-literal
        [...entries].map(entry => this.updateEntry(entry['id'], entry))
      ).then((updated: T[]) => resolve(updated))
        .catch(reject);
    });
  }

  protected appendValueToArray(key: { id: string | number, lastModified?: number }, parameter: string, value: any): Promise<T> {
    const params = {
      TableName: this.table,
      Key: {...key},
      ReturnValues: 'UPDATED_NEW',
      UpdateExpression: 'set #param = list_append(if_not_exists(#param, :newList), :data)',
      ExpressionAttributeNames: {
        '#param': parameter
      },
      ExpressionAttributeValues: {
        ':data': [value],
        ':newList': [value]
      }
    };
    return new Promise((resolve, reject) => {
      this.client.update(params, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data as T);
      });
    });
  }

  getByIdAfter(id: number | string, lastModified: number, table: string = this.table): Promise<T[]> {
    return this.query({
      TableName: table,
      KeyConditionExpression: '#id = :id and #lastModified >= :lastModified',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#lastModified': 'lastModified'
      },
      ExpressionAttributeValues: {
        ':id': id,
        ':lastModified': lastModified,
      }
    });
  }

  protected getByIdBefore(id: number | string, lastModified: number, table: string = this.table): Promise<T[]> {
    return this.query({
      TableName: table,
      KeyConditionExpression: '#id = :id and #lastModified < :lastModified',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#lastModified': 'lastModified'
      },
      ExpressionAttributeValues: {
        ':id': id,
        ':lastModified': lastModified,
      }
    });
  }

  protected getAllAfterForUser(lastModified: number): Promise<T[]> {
    const userId = AuthorizationUtil.token.sub;
    return this.scan({
      TableName: this.table,
      FilterExpression: '#lastModified > :lastModified and contains(#userId, :userId)',
      ExpressionAttributeNames: {
        '#lastModified': 'lastModified',
        '#userId': 'memberIds'
      },
      ExpressionAttributeValues: {
        ':lastModified': lastModified,
        ':userId': userId
      }
    });
  }

  getAll(): Promise<T[]> {
    return this.scan({
      TableName: this.table
    });
  }

  protected getAllAfter(lastModified: number): Promise<T[]> {
    return this.scan({
      TableName: this.table,
      FilterExpression: '#lastModified > :lastModified',
      ExpressionAttributeNames: {
        '#lastModified': 'lastModified',
      },
      ExpressionAttributeValues: {
        ':lastModified': lastModified
      }
    });
  }

  protected getOne(id: string | number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.query({
        TableName: this.table,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'id'
        },
        ExpressionAttributeValues: {
          ':id': id
        }
      })
        .then(entries =>
          resolve(entries[0]))
        .catch(reject);
    });
  }

  protected getAllForIndex(indexName: string, keyName: string, keyValue: any, lastModified: number): Promise<T[]> {
    const key = {};
    key[keyName] = keyValue;
    return this.query({
      TableName: this.table,
      IndexName: indexName,
      KeyConditionExpression: '#id = :id',
      FilterExpression: '#lastModified > :lastModified',
      ExpressionAttributeNames: {
        '#id': keyName,
        '#lastModified': 'lastModified'
      },
      ExpressionAttributeValues: {
        ':id': keyValue,
        ':lastModified': lastModified
      }
    });
  }
}
