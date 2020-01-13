import {GzipUtil} from '../utils/gzip.util';
import {AWS_DETAILS} from '../secrets';

const AWS = require('aws-sdk');

export class S3Handler {

  private getS3() {
    const s3 = new AWS.S3({
      accessKeyId: AWS_DETAILS.ACCESS_KEY,
      secretAccessKey: AWS_DETAILS.SECRET_ACCESS_KEY
    });
    return s3;
  }

  save(data: any, path: string, queryData: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new GzipUtil()
        .compress(data)
        .then(result =>
          this.uploadGzip(path, result, queryData)
            .then(resolve)
            .catch(reject))
        .catch(reject);
    });
  }

  list(bucket: string, prefix: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const s3 = this.getS3();
      s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix
      }, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });
  }

  get(bucket: string, file: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const s3 = this.getS3();
      s3.getObject({
        Bucket: bucket,
        Key: file
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  copy(origin: string, target: string, bucket: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const s3 = this.getS3();
      s3.copyObject({
        Bucket: bucket,
        CopySource: `${bucket}/${origin}`,
        Key: target
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private uploadGzip(path: string, buffer: Buffer, queryData: any) {
    return new Promise<any>((resolve, reject) => {
      const s3 = this.getS3(),
        region = queryData.region;

      console.log(`Uploading to s3 -> ${path}`);
      s3.upload({
        Bucket: this.getBucketName(region),
        Key: path,
        Body: buffer,
        ContentEncoding: 'gzip',
        ContentType: 'application/json'
      }, function (error, s3Response) {
        if (error) {
          console.error(error);
          reject(error);
          return;
        }
        queryData.url = s3Response.Location;
        resolve(queryData);
      });
    });
  }

  private getBucketName(region) {
    let bucket = 'wah-data';

    if (region) {
      if (region === 'tw' || region === 'kr') {
        bucket += '-as';
      } else {
        bucket += '-' + region;
      }
    }
    return bucket;
  }
}
