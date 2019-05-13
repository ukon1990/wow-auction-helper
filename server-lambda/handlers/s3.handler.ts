import {GzipUtil} from '../utils/gzip.util';
import {AWS_DETAILS} from '../secrets';

const AWS = require('aws-sdk');

export class S3Handler {
  save(data: any, path: string): void {
    const gzip = new GzipUtil();
    const s3 = new AWS.S3({
      accessKeyId: AWS_DETAILS.ACCESS_KEY,
      secretAccessKey: AWS_DETAILS.SECRET_ACCESS_KEY
    });

    s3.upload({
      Bucket: 'testBucket',
      Key: path,
      Body: JSON.stringify(data, null, 2)
    }, function (error, s3Response) {
      if (error) {
        console.error(error);
      }
      console.log(`File uploaded successfully at ${s3Response}`);
    });
  }
}
