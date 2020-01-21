import {DeleteItemOutput, DocumentClient, Key, QueryOutput} from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk';
import {AWSError} from 'aws-sdk';
import {last} from 'rxjs/operators';
import {DYNAMO_DB} from '../../secrets';

export abstract class BaseRepository<T> {
  protected client: DocumentClient;

  protected constructor(protected table: string) {
    AWS.config.update({
      region: DYNAMO_DB.REGION
    });
    this.client = new DocumentClient();
  }

  abstract add(data: T): Promise<T | AWSError>;

  abstract update(data: T): Promise<T | AWSError>;

  abstract getById(id: number): Promise<T | AWSError>;

  protected put(data: T): Promise<T | AWSError> {
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

  protected delete(id: number): Promise<DeleteItemOutput | AWSError> {
    const params = {
      TableName: this.table,
      Key: {
        'id': id
      },
      ConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    };
    return new Promise((resolve, reject) => {
      this.client.delete(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  protected appendValueToArray(id: number, lastModified: number, parameter: string, value: any): Promise<T | AWSError> {
    const params = {
      TableName: this.table,
      Key: {id, lastModified},
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

  protected getAllAfter(lastModified: number): Promise<T[] | AWSError> {
    return new Promise((resolve, reject) => {
      this.client.scan({
        TableName: this.table,
        FilterExpression: '#lastModified > :lastModified',
        ExpressionAttributeNames: {
          '#lastModified': 'lastModified',
        },
        ExpressionAttributeValues: {
          ':lastModified': lastModified
        }
      }, (error: AWSError, data: QueryOutput) => {
        if (error) {
          reject(error);
          return;
        }
        const items: any[] = data.Items;
        resolve(items);
      });
    });
  }

  protected getOne(id: number): Promise<T | AWSError> {
    return new Promise((resolve, reject) => {
      this.client.query({
        TableName: this.table,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'id'
        },
        ExpressionAttributeValues: {
          ':id': id
        }
      }, (error: AWSError, data: QueryOutput) => {
        if (error) {
          reject(error);
          return;
        }
        const items: any[] = data.Items;
        resolve(items[0]);
      });
    });
  }

  protected getAllForIndex(indexName: string, keyName: string, keyValue: any, lastModified: number): Promise<T[] | AWSError> {
    const key = {};
    key[keyName] = keyValue;
    return new Promise((resolve, reject) => {
      this.client.query({
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
      }, (error: AWSError, data: QueryOutput) => {
        if (error) {
          reject(error);
          return;
        }
        const items: any[] = data.Items;
        resolve(items);
      });
    });
  }
}
