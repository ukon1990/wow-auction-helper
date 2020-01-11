import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../utils/response.util';
import {AHDumpResponse} from '../models/auction/ah-dump-response.model';
import {AuthHandler} from './auth.handler';
import {BLIZZARD} from '../secrets';
import {Endpoints} from '../utils/endpoints.util';
import {S3Handler} from './s3.handler';
import {DatabaseUtil} from '../utils/database.util';
import {RealmQuery} from '../queries/realm.query';
import {HttpClientUtil} from '../utils/http-client.util';
import {AuctionUpdateLog} from '../models/auction/auction-update-log.model';
import {RealmHandler} from './realm.handler';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

export class AuctionHandler {

  async getUpdateLog(ahId: number, hours: number = 24): Promise<AuctionUpdateLog> {
    const fromDate = +new Date() - hours * 60 * 60 * 1000;
    return new Promise<AuctionUpdateLog>((resolve, reject) => {
      new DatabaseUtil().query(RealmQuery.getUpdateHistoryForRealm(ahId, fromDate))
        .then(res => resolve(new AuctionUpdateLog(res)))
        .catch(reject);
    });
  }

  async post(region: string, realm: string, timestamp: number, url: string): Promise<any> {
    if (url) {
      return this.getAuctionDump(url);
    } else {
      return this.latestDumpPathRequest(region, realm, timestamp);
    }
  }

  async latestDumpPathRequest(region: string, realm: string, timestamp: number) {
    return new Promise<any>(async (resolve, reject) => {
      if (region && realm) {
        let apiResponse;

        await AuthHandler.getToken()
          .then(token => BLIZZARD.ACCESS_TOKEN = token)
          .catch(() => console.error('Unable to fetch token'));

        apiResponse = await this.getLatestDumpPath(region, realm)
          .then(response => apiResponse = response)
          .catch(() => console.error('Unable to fetch data'));

        resolve(apiResponse);
      } else {
        reject('Realm or region is missing from the request');
      }
    });
  }

  async getAuctionDump(url: string) {
    return new Promise<any>((resolve, reject) => {
      if (url) {
        this.downloadDump(url)
          .then(({body}) => resolve(body))
          .catch(reject);
      } else {
        reject('Could not get the auction dump, no URL were provided');
      }
    });
  }

  private getLatestDumpPath(region: string, realm: string): Promise<AHDumpResponse> {
    const url = new Endpoints().getPath(`auction/data/${realm}`, region);
    return new Promise<AHDumpResponse>((resolve, reject) => {
      request.get(
        url,
        async (error, response, body) => {
          try {
            body = JSON.parse(body);

            if (error) {
              reject(error);
            }
            resolve(body.files[0]);
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  private async sendToS3(data: any, region: string, ahId: number, lastModified: number, oldLastModified: number, size: number,
                         delay: { avg: number; highest: number; lowest: number }): Promise<any> {
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
                ahId, r.url, lastModified, size, delay))
            .then(async () => {
              console.log(`Successfully updated id=${ahId}`);

              resolve();
              Promise.all([
                this.createAuctionsFile(data, region, ahId, lastModified, size),
                this.createLastModifiedFile(ahId, region),
                this.updateAllStatuses(region)
              ])
                .catch(console.error);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  private async createAuctionsFile(data: any, region: string, ahId: number, lastModified: number, size: number) {
    return new Promise((resolve) => {
      new S3Handler().save(
        data, `auctions/${region}/${ahId}/auctions.json.gz`,
        {region, ahId, lastModified, size})
        .then((res) => {
          console.log(res);
          resolve();
        })
        .catch(error => {
          console.error(error);
          resolve();
        });
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
        .getAllHousesWithLastModifiedOlderThanPreviousDelayOrOlderThanOneDay())
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
    const query = RealmQuery.setNonRequestedHousesToNotAutoUpdate(14);
    console.log('AuctionHandler.x', query);
    await new DatabaseUtil()
      .query(query)
      .then(dbResponse => {
        Response.send('Successfully deactivated unused houses', callback);
        console.log('Successfully deactivated unused houses', dbResponse);
      })
      .catch(error => {
        Response.error(callback, error, event);
      });
  }

  private addUpdateHousePromise(promises, promiseThrottle, row, event: APIGatewayEvent) {
    promises.push(
      promiseThrottle.add(
        new HttpClientUtil()
          .post
          .bind(
            this,
            new Endpoints()
              .getLambdaUrl('auction/update-one', row.region),
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
        .catch(e => {
          error = e;
        });

      if (!error && ahDumpResponse && ahDumpResponse.lastModified > dbResult.lastModified) {
        console.log(`Updating id=${dbResult.id}`);
        await this.setIsUpdating(dbResult.id, true);
        this.downloadDump(ahDumpResponse.url)
          .then(async r => {
            console.log('Done downloading for id=', dbResult.id);
            this.sendToS3(
              r.body, dbResult.region, dbResult.id,
              ahDumpResponse.lastModified,
              dbResult.lastModified,
              this.getSizeOfResponseInMB(r),
              await this.getDelay(dbResult,
                ahDumpResponse.lastModified))
              .then(async (res) => {
                console.log('Successfully uploaded to bucket for id=', dbResult.id);
                resolve(res);
                await this.setIsUpdating(dbResult.id, false);
              })
              .catch(async err => {
                reject(err);
                console.error('Could not upload to s3', err);
                await this.setIsUpdating(dbResult.id, false);
              });
          })
          .catch(e => {
            this.setIsUpdating(dbResult.id, false)
              .catch(console.error);
            reject(e);
          });
      } else if (error) {
        console.error(`Could not update id=${dbResult.id}`, error);
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

  private async getDelay(dbResult: { id; region; slug; name; lastModified; url; lowestDelay; avgDelay; highestDelay },
                         lastModified: number) {
    const {minTime, avgTime, maxTime} = await this.getUpdateLog(dbResult.id, 72);

    dbResult.lowestDelay = minTime > 120 ? 120 : minTime;
    dbResult.avgDelay = avgTime;
    dbResult.highestDelay = maxTime;
    return {
      lowest: dbResult.lowestDelay, avg: dbResult.avgDelay, highest: dbResult.highestDelay
    };
  }

  private async createLastModifiedFile(ahId: number, region: string) {
    return new Promise((resolve) => {
      new DatabaseUtil().query(RealmQuery.getHouse(ahId, 0))
        .then(async rows => {
          if (rows) {
            for (const realm of rows) {
              await new S3Handler().save(realm, `auctions/${region}/${realm.slug}.json.gz`, {url: '', region})
                .then(uploaded => {
                  console.log(`Timestamp uploaded for ${ahId} @ ${uploaded.url}`);
                })
                .catch(error => {
                  console.error(error);
                });
            }
          }
          resolve();
        })
        .catch(error => {
          console.error(error);
          resolve();
        });
    });
  }

  private async updateAllStatuses(region: string) {
    return new Promise((resolve, reject) => {
      new RealmHandler().getAllRealms()
        .then((realms) => {
          new S3Handler().save(realms, `auctions/${region}/status.json.gz`, {url: '', region})
            .then((data) => {
              console.log('Updated realm statuses', data);
              resolve();
            })
            .catch(resolve);
        })
        .catch(resolve);
    });
  }
}
