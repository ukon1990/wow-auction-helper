import {APIGatewayEvent, Callback, Context, Handler} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {AHDumpResponse} from '../models/auction/ah-dump-response.model';
import {AuthHandler} from './auth.handler';
import {BLIZZARD} from '../secrets';
import {Endpoints} from '../utils/endpoints.util';
import {S3Handler} from './s3.handler';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from '../queries/realm.query';
import {HttpClientUtil} from '../utils/http-client.util';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

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

      apiResponse = await this.getLatestDumpPath(region, realm)
        .then(response => apiResponse = response)
        .catch(() => console.error('Unable to fetch data'));

      Response.send(apiResponse, callback);
    } else {
      Response.error(callback, 'Realm or region is missing from the request');
    }
  }

  async getAuctionDump(url: string, callback: Callback) {
    if (url) {
      this.downloadDump(url)
        .then((response) =>
          Response.send(response.body, callback))
        .catch(error =>
          Response.error(callback, error));
    } else {
      Response.error(callback, 'Could not get the auction dump, no URL were provided');
    }
  }

  private getLatestDumpPath(region: string, realm: string): Promise<AHDumpResponse> {
    const url = new Endpoints().getPath(`auction/data/${realm}`, region);
    return new Promise<AHDumpResponse>((resolve, reject) => {
      request.get(
        url,
        (error, response, body) => {
          body = JSON.parse(body);

          if (error) {
            // TODO: Logic
            reject(error);
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

  private async sendToS3(data: any, region: string, ahId: number, lastModified: number, oldLastModified: number, size: number,
                         delay: { avg: any; highest: any; lowest: any }): Promise<any> {
    return new Promise((resolve, reject) => {
      new S3Handler().save(
        data,
        `auctions/${region}/${ahId}/${lastModified}.json.gz`,
        {
          region, ahId, lastModified, size
        })
        .then(async r => {
          await new DatabaseUtil().query(RealmQuery
            .insertNewDumpLogRow(ahId, r.url, lastModified, oldLastModified, size));

          console.log('Sending to S3');
          new DatabaseUtil()
            .query(RealmQuery
              .updateUrl(
              ahId, r.url, lastModified, size, delay ))
            .then(() => {
              console.log(`Successfully updated id=${ahId}`);
              resolve();
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  async s3(event: APIGatewayEvent, context: Context, callback: Callback) {
    try {
      Response.send({
        message: 'Downloading started'
      }, callback);
      const body = JSON.parse(event.body),
        ahId = body.ahId;
      let house;

      await new DatabaseUtil()
        .query(RealmQuery.getHouse(ahId))
        .then(rows =>
          house = rows.length > 0 ? rows[0] : undefined);

      if (!house) {
        throw Error('Not found');
      }
      await AuthHandler.getToken()
        .catch(console.error);
      this.updateHouse(house)
        .then(() => {
        })
        .catch(console.error);
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
        (error, response, body) => {
          if (error || !response) {
            console.log('In download dump error', error);
            reject(error);
          } else {
            try {
              response['body'] = JSON.parse(body);
              console.log('In download dump complete');
              resolve(response);
            } catch (exception) {
              console.log('In download dump fail');
              reject(exception);
            }
          }
        });
    });
  }

  async updateAllHouses(event: APIGatewayEvent, callback: Callback) {
    const region = event.body ?
      JSON.parse(event.body).region : undefined;
    await AuthHandler.getToken()
      .catch(console.error);
    console.log('Starting AH updates');

    new DatabaseUtil()
      .query(RealmQuery
        .getAllHousesWithLastModifiedOlderThanPreviousDelay()) // This is the lowest dump update frequency found in EU and US
      .then(async rows => {
        const promiseThrottle = new PromiseThrottle({
            requestsPerSecond: 50,
            promiseImplementation: Promise
          }),
          promises = [];
        console.log(`Updating ${rows.length} houses.`);

        Response.send({
          message: `Updating ${rows.length} houses.`,
          rows
        }, callback);

        rows.forEach(row => {
          if (region && row.region !== region) {
            return;
          }
          this.addUpdateHousePromise(promises, promiseThrottle, row, event);
        });

        await Promise.all(promises)
          .then(() =>
            console.log('Done initiating AH updates'))
          .catch(console.error);
      })
      .catch(error =>
        Response.error(callback, error, event));
  }

  async deactivateInactiveHouses(event: APIGatewayEvent, callback: Callback): Promise<void> {
    new DatabaseUtil()
      .query(RealmQuery.setNonRequestedHousesToNotAutoUpdate(14))
      .then(dbResponse => {
        Response.send('Successfully deactivated unused houses', callback);
        console.log('Successfully deactivated unused houses', dbResponse);
      })
      .catch(error =>
        Response.error(callback, error, event));
  }

  private addUpdateHousePromise(promises, promiseThrottle, row, event: APIGatewayEvent) {
    promises.push(
      promiseThrottle.add(
        new HttpClientUtil()
          .post
          .bind(
            this,
            new Endpoints()
              .getLambdaUrl('auction/update-one', row.region, event),
            row,
            true)));
  }

  async updateHouseRequest(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body);
    Response.send({
      message: 'started updateHouseRequest',
      request: body
    }, callback);

    await AuthHandler.getToken()
      .catch(console.error);

    this.updateHouse(body)
      .then(() => {
      })
      .catch(console.error);
  }

  private async updateHouse(dbResult: { id, region, slug, name, lastModified, url, lowestDelay, avgDelay, highestDelay }): Promise<any> {
    let error, ahDumpResponse: AHDumpResponse;
    return new Promise<any>(async (resolve, reject) => {
      await this.getLatestDumpPath(dbResult.region, dbResult.slug)
        .then((r: AHDumpResponse) =>
          ahDumpResponse = r)
        .catch(e => error = e);
      if (ahDumpResponse && ahDumpResponse.lastModified > dbResult.lastModified) {
        console.log(`Updating id=${dbResult.id}`);
        await this.setIsUpdating(dbResult.id, true);
        this.downloadDump(ahDumpResponse.url)
          .then(r => {
            this.sendToS3(
              r.body, dbResult.region, dbResult.id,
              ahDumpResponse.lastModified,
              dbResult.lastModified,
              this.getSizeOfResponseInMB(r),
              this.getDelay(dbResult,
                ahDumpResponse.lastModified))
              .then(resolve)
              .catch(reject);
          })
          .catch(e => {
            this.setIsUpdating(dbResult.id, false)
              .catch(console.error);
            reject(e);
          });
      } else if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve();
      }
    });
  }

  private setIsUpdating(ahId: number, isUpdating) {
    return new DatabaseUtil()
      .query(RealmQuery.isUpdating(ahId, isUpdating))
      .then()
      .catch(console.error);
  }

  private getDelay(dbResult: { id; region; slug; name; lastModified; url; lowestDelay; avgDelay; highestDelay }, lastModified: number) {
    const diff = Math.round((lastModified - dbResult.lastModified) / 60000);
    console.log(`The diff for ${dbResult.id} is ${diff}`, dbResult.lowestDelay, dbResult.highestDelay);

    if (diff < dbResult.lowestDelay && diff >= 1 || !dbResult.lowestDelay) {
      dbResult.lowestDelay = diff;
      console.log(`Decreasing lowest with ${diff - dbResult.lowestDelay}`);
    }


    if (diff < 120) {
      if (diff !== dbResult.avgDelay && dbResult.avgDelay) {
        dbResult.avgDelay = (dbResult.avgDelay + diff) / 2;
      } else if (!dbResult.avgDelay) {
        dbResult.avgDelay = diff;
      }

      if (diff > dbResult.highestDelay) {
        dbResult.highestDelay = diff;
        console.log(`Increasing highest with ${diff - dbResult.highestDelay}`);
      }
    }

    return {
      lowest: dbResult.lowestDelay, avg: dbResult.avgDelay, highest: dbResult.highestDelay
    };
  }
}
