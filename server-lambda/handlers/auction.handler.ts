import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {AHDumpResponse} from '../models/auction/ah-dump-response.model';
import {AuthHandler} from './auth.handler';
import {BLIZZARD} from '../secrets';
import {Endpoints} from '../utils/endpoints.util';
import {S3Handler} from './s3.handler';

const request: any = require('request');
const RequestPromise = require('request-promise');

export class AuctionHandler {

  async post(event: APIGatewayEvent, context: Context, callback: Callback) {
    const body = JSON.parse(event.body),
      region = body.region,
      realm = body.realm,
      timestamp = body.timestamp,
      url = body.url;

    if (url) {
      this.getAuctionDump(url, callback);
    } else {
      this.latestDumpPathRequest(region, realm, timestamp, callback);
    }
  }

  async latestDumpPathRequest(region, realm, timestamp, callback: Callback) {
    if (region && realm) {
      let apiResponse;

      await AuthHandler.getToken()
        .then(token => BLIZZARD.ACCESS_TOKEN = token)
        .catch(error => console.error('Unable to fetch token'));

      await this.getLatestDumpPath(region, realm)
        .then(response => apiResponse = response)
        .catch(error => console.error('Unable to fetch data'));
      console.log('Has response?', apiResponse);

      Response.send(apiResponse, callback);
    } else {
      Response.error(callback, 'Realm or region is missing from the request');
    }
  }

  async getAuctionDump(url: string, callback: Callback) {
    if (url) {
      this.downloadDump(url)
        .then((response) =>
          Response.send(response.dump, callback))
        .catch(error =>
          Response.error(callback, error));
    } else {
      Response.error(callback, 'Could not get the auction dump, no URL were provided');
    }
  }

  private getLatestDumpPath(region: string, realm: string): Promise<AHDumpResponse> {
    return new Promise<AHDumpResponse>((resolve, reject) => {
      request.get(
        new Endpoints().getPath(`auction/data/${realm}`, region),
        (error, response, body) => {
          body = JSON.parse(body);

          if (error) {
            // TODO: Logic
            resolve(undefined);
          }
          resolve(body.files[0]);
        });
    });
  }

  private getAuctionLink(event: APIGatewayEvent, context: Context, callback: Callback): Promise<boolean> {
    const url = event['url'] || JSON.parse(event.body).url;
    return new Promise<any>((resolve, reject) => {
      resolve();
    });
  }

  private sendToS3(data: any, region: string, ahId: number, lastModified: number, size: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new S3Handler().save(
        data,
        `auctions/${region}/${ahId}/${lastModified}.json.gz`,
        {
          region, ahId, lastModified, size
        });
      resolve();
    });
  }

  s3(event: APIGatewayEvent, context: Context, callback: Callback) {
    try {
      const body = JSON.parse(event.body),
        url = body.url,
        lastModified = body.lastModified,
        ahId = body.ahId;
      Response.send({
        message: 'Downloading started'
      }, callback);
      this.downloadDump(url)
        .then(r => {
          console.log(`Download success. Sending ${this.getSizeOfResponseInMB(r)}MB to s3.`);
          this.sendToS3(r.body, 'eu', ahId, lastModified, this.getSizeOfResponseInMB(r));
        })
        .catch(error =>
          Response.error(callback, error, event));
    } catch (error) {
      Response.error(callback, error, event);
    }

  }

  private getSizeOfResponseInMB(r) {
    if (r && !r.headers || !r.headers['content-length']) {
      return 0;
    }

    return +(r.headers['content-length'] / 1000000).toFixed(2);
  }

  private downloadDump(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request.get(url,
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            try {
              response.body = JSON.parse(response.body);
              resolve(response);
            } catch (exception) {
              reject(exception);
            }
          }
        });
    });
  }
}
