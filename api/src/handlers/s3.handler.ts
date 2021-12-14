import {GzipUtil} from '../utils/gzip.util';
import {AWS_DETAILS} from '../secrets';
import {ListObjectsV2Output, ManagedUpload, ObjectList} from 'aws-sdk/clients/s3';
import {AuctionProcessorUtil} from '../auction/utils/auction-processor.util';
import {StatsRepository} from '../auction/repository/stats.repository';

const AWS = require('aws-sdk');

export class S3Handler {

  static getBucketUrlForRegion(region: string, path: string): string {
    switch (region) {
      case 'eu':
        return `https://wah-data-eu.s3.eu-west-1.amazonaws.com/` + path;
      case 'us':
      case 'beta':
        return `https://wah-data-us.s3-us-west-1.amazonaws.com/` + path;
      case 'kr':
      case 'tw':
        return `https://wah-data-as.s3.ap-northeast-2.amazonaws.com/` + path;
    }
  }

  private getS3() {
    return new AWS.S3({
      accessKeyId: AWS_DETAILS.ACCESS_KEY,
      secretAccessKey: AWS_DETAILS.SECRET_ACCESS_KEY
    });
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

  list(bucket: string, prefix: string, maxKeys = 10): Promise<ListObjectsV2Output> {
    return new Promise<any>((resolve, reject) => {
      const s3 = this.getS3();
      const params = {
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      };
      if (maxKeys > 1000) {
        const resultObjects: ObjectList = [];
        let baseObject: ListObjectsV2Output;
        s3.listObjectsV2(params).eachPage((error, data, done) => {
          if (!data || !data.Contents) {
            resolve({
              ...baseObject,
              Contents: resultObjects,
            });
            return;
          }
          data.Contents.forEach(obj => {
            if (obj.Key) {
              resultObjects.push(obj);
            }
          });
          if (!baseObject) {
            baseObject = data;
          }
          done();
        });
      } else {
        s3.listObjectsV2(params, (error, data) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data);
        });
      }
    });
  }

  deleteObject(bucket: string, file: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const s3 = this.getS3();
      s3.deleteObject({
        Bucket: bucket,
        Key: file
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  get(bucket: string, file: string): Promise<any> {
    const s3 = this.getS3();
    return s3.getObject({
      Bucket: bucket,
      Key: file
    }).promise();
  }

  getAndDecompress<T>(bucket: string, file: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.get(bucket, file)
        .then(async data => {
          await new GzipUtil().decompress(data['Body'])
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  copy(origin: string, target: string, bucket: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const s3 = this.getS3();
      console.log(`Copying from ${origin} to ${target} in ${bucket}`);
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

  private uploadGzip(path: string, buffer: Buffer, queryData: { [key: string]: any }) {
    return new Promise<any>((resolve, reject) => {
      const s3 = this.getS3(),
        region = queryData.region === 'beta' ? 'us' : queryData.region;

      console.log(`Uploading to s3 -> ${path}`, this.getBucketName(region));
      s3.upload({
        Bucket: this.getBucketName(region),
        Key: path,
        Body: buffer,
        ContentEncoding: 'gzip',
        ContentType: 'application/json'
      }, function (error: Error, s3Response: ManagedUpload.SendData) {
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
