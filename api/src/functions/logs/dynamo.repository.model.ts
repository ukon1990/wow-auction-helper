import {BaseRepository} from '../../repository/base.repository';
import {AWSError} from 'aws-sdk';

export class LogDynamoRepository extends BaseRepository<any> {
  constructor() {
    super('wah_access_logs');
  }

  add(data: any): Promise<AWSError | any> {
    return new Promise<any>((resolve, reject) => {
      const start = +new Date();

      this.put(data)
        .then((res) => {
          console.log(`Updated DynamoDB in ${+new Date() - start} ms`);
          resolve(res);
        })
        .catch(reject);
    });
  }

  getAllAfterTimestamp(timestamp: number): Promise<any[]> {
    return Promise.resolve(undefined);
  }

  getById(id: string): Promise<AWSError | any> {
    return Promise.resolve(undefined);
  }
}