import {GzipUtil} from '../utils/gzip.util';
import {AWS_DETAILS} from '../secrets';

const AWS = require('aws-sdk');

export class S3Handler {
  save(data: any, path: string, queryData: any): void {
    new GzipUtil()
      .compress(data)
      .then(result =>
        this.uploadGzip(path, result, queryData))
      .catch(console.error);
  }

  private uploadGzip(path: string, buffer: Buffer, queryData: any) {
    const s3 = new AWS.S3({
      accessKeyId: AWS_DETAILS.ACCESS_KEY,
      secretAccessKey: AWS_DETAILS.SECRET_ACCESS_KEY
    });

    console.log(`Uploading to s3 -> ${ path }`);
    s3.upload({
      Bucket: 'wah-data',
      Key: path,
      Body: buffer,
      ContentEncoding: 'gzip',
      ContentType: 'application/json'
    }, function (error, s3Response) {
      if (error) {
        console.error(error);
      }
      queryData.url = s3Response.Location;
      console.log('Query data is', queryData);
      console.log(`File uploaded successfully at ${s3Response.Location}`);
    });
  }
}
