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
import {EventRecord, EventSchema} from '../models/s3/event-record.model';
import {GzipUtil} from '../utils/gzip.util';
import {AuctionProcessorUtil} from '../utils/auction-processor.util';
import {AuctionHouseStatus} from '../../../client/src/client/modules/auction/models/auction-house-status.model';
import {AuctionResponse} from '../models/auction/auctions-response';
import {Auction} from '../models/auction/auction';
import {ItemPriceEntry} from '../../../client/src/client/modules/item/models/item-price-entry.model';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

export class AuctionHandler {

  async getUpdateLog(ahId: number, hours: number = 24, conn = new DatabaseUtil()): Promise<AuctionUpdateLog> {
    const fromDate = +new Date() - hours * 60 * 60 * 1000;
    return new Promise<AuctionUpdateLog>((resolve, reject) => {
      conn.query(RealmQuery.getUpdateHistoryForRealm(ahId, fromDate))
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

  private async sendToS3(data: any, region: string, ahId: number, lastModified: number): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`Sending ${ahId} to S3`);
      new S3Handler().save(
        data,
        `auctions/${region}/${ahId}/${lastModified}-lastModified.json.gz`,
        {
          region, ahId, lastModified
        })
        .then(r => {
          console.log('Successfully uploaded id=', ahId);
          resolve(r);
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
            console.log('Could not download AH dump', error);
            reject(error);
          } else {
            try {
              response['body'] = JSON.parse(body);
              console.log('Successfully downloaded AH dump');
              resolve(response);
            } catch (exception) {
              console.log('Could not turn AH dump to JSON', exception);
              reject(exception);
            }
          }
        });
    });
  }

  async updateAllHouses(region: string): Promise<any> {
    await AuthHandler.getToken()
      .catch(console.error);
    console.log('Starting AH updates');

    return new Promise((resolve, reject) => {
      new DatabaseUtil()
        .query(RealmQuery
          .getAllHousesWithLastModifiedOlderThanPreviousDelayOrOlderThanOneDay())
        .then(async rows => {
          const promiseThrottle = new PromiseThrottle({
              requestsPerSecond: 5,
              promiseImplementation: Promise
            }),
            promises = [];
          console.log(`Updating ${rows.length} houses.`);


          rows.forEach(row => {
            if (region && row.region !== region) {
              return;
            }
            this.addUpdateHousePromise(promises, promiseThrottle, row);
          });

          Promise.all(promises)
            .then(() =>
              console.log('Done initiating AH updates'))
            .catch(console.error);

          resolve({
            message: `Updating ${rows.length} houses.`,
            rows
          });
        })
        .catch(reject);
    });
  }

  async deactivateInactiveHouses(event: APIGatewayEvent, callback: Callback): Promise<void> {
    const query = RealmQuery.setNonRequestedHousesToNotAutoUpdate(14);
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

  private addUpdateHousePromise(promises, promiseThrottle, row) {
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
      const startGetDumpPath = +new Date();
      await this.getLatestDumpPath(dbResult.region, dbResult.slug)
        .then((r: AHDumpResponse) =>
          ahDumpResponse = r)
        .catch(e => {
          error = e;
        });
      console.log(`Fetching ah dump url took ${+new Date() - startGetDumpPath}ms`, ahDumpResponse);

      if (!error && ahDumpResponse && ahDumpResponse.lastModified > dbResult.lastModified) {
        console.log('Starting upload');
        new S3Handler().save(ahDumpResponse, `auctions/${dbResult.region}/${dbResult.id}/dump-path.json.gz`,
          {region: dbResult.region})
          .then((res) => {
            console.log('Successfully uploaded:', res);
            resolve();
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      } else if (error) {
        console.error(`Could not update id=${dbResult.id}`, error);
        reject(error);
      } else {
        console.log('No new update available');
        resolve();
      }
    });
  }

  private getAndUploadAuctionDump(ahDumpResponse: AHDumpResponse, id, region) {
    const dumpDownloadStart = +new Date();
    console.log(`Downloading dump for ${id} with url=${ahDumpResponse.url}`);
    return new Promise((resolve, reject) => {
      this.downloadDump(ahDumpResponse.url)
        .then(async r => {
          console.log(`Done downloading for id=${id} (${+new Date() - dumpDownloadStart}ms)`);
          this.sendToS3(
            r.body, region, id,
            ahDumpResponse.lastModified)
            .then(async (res) => {
              console.log('Successfully uploaded to bucket for id=', id);
              resolve(res);
              // await this.setIsUpdating(dbResult.id, false);
            })
            .catch(async err => {
              console.error('Could not upload to s3', err);
              //  await this.setIsUpdating(dbResult.id, false);
            });
        })
        .catch(e => {
          // this.setIsUpdating(dbResult.id, false)
          //   .catch(console.error);
          reject(e);
        });
    });
  }

  private setIsUpdating(ahId: number, isUpdating) {
    return new DatabaseUtil()
      .query(RealmQuery.isUpdating(ahId, isUpdating))
      .then()
      .catch(console.error);
  }

  private async getDelay(id, conn = new DatabaseUtil()) {
    const {minTime, avgTime, maxTime} = await this.getUpdateLog(id, 72, conn);

    const lowestDelay = minTime > 120 ? 120 : minTime;
    return {
      lowest: lowestDelay, avg: avgTime, highest: maxTime
    };
  }

  private async createLastModifiedFile(ahId: number, region: string) {
    return new Promise((resolve) => {
      new DatabaseUtil().query(RealmQuery.getHouse(ahId, 0))
        .then(async rows => {
          if (rows) {
            for (const realm of rows) {
              await new DatabaseUtil().query(
                RealmQuery.getHouseForRealm(realm.region, realm.slug))
                .then(async (data) => {
                  await new S3Handler().save(data[0], `auctions/${region}/${realm.slug}.json.gz`, {url: '', region})
                    .then(uploaded => {
                      console.log(`Timestamp uploaded for ${ahId} @ ${uploaded.url}`);
                    })
                    .catch(error => {
                      console.error(error);
                    });
                })
                .catch(console.error);
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

  private async updateAllStatuses(region: string, conn: DatabaseUtil) {
    return new Promise((resolve, reject) => {
      new RealmHandler().getAllRealms(conn)
        .then((realms) => {
          new S3Handler().save(realms, `auctions/${region}/status.json.gz`, {url: '', region})
            .then(() => {
              console.log('Updated realm statuses');
              resolve();
            })
            .catch(resolve);
        })
        .catch(resolve);
    });
  }

  updateStaticS3Data(records: EventRecord[]) {
    return new Promise(async (resolve, reject) => {
      for (const record of records) {
        try {
          await this.processS3Record(record.s3);
        } catch (e) {
        }
      }
      resolve();
    });
  }

  private processS3Record(record: EventSchema) {
    return new Promise(async (resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const conn = new DatabaseUtil(false);
      const regex = /auctions\/[a-z]{2}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [auctions, region, ahId, fileName] = splitted;
        await this.updateDBEntries(record, region, +ahId, fileName, conn)
          .catch(console.error);
        await Promise.all([
          this.updateAllStatuses(region, conn),
          this.createLastModifiedFile(+ahId, region),
          await this.copyAuctionsToNewFile(record, auctions, region, ahId),
          this.processAuctions(region, record, +ahId, fileName, conn)
            .catch(console.error)
        ])
          .catch(console.error);
      }
      conn.end();
      resolve();
    });
  }

  async processAuctions(region: string, record: EventSchema, ahId: number, fileName: string, conn = new DatabaseUtil()) {
    return new Promise<void>((resolve, reject) => {
      new S3Handler().get(record.bucket.name, record.object.key)
        .then(async data => {
          const processStart = +new Date();
          await new GzipUtil().decompress(data['Body'])
            .then(({auctions}) => {
              const lastModified = +fileName.split('-')[0];
              if (!lastModified) {
                resolve();
                return;
              }
              console.log(`Decompressing auctions took ${+new Date() - processStart} ms for ${lastModified} @ id=${ahId}`);
              const query = AuctionProcessorUtil.process(
                auctions, lastModified, ahId);
              const insertStart = +new Date();
              conn.query(query)
                .then(async ok => {
                  console.log(`Completed item price stat import in ${+new Date() - insertStart} ms`, ok);
                  /*await this.updateHistoricalData(region, ahId, conn)
                    .catch(console.error);*/
                  resolve();
                })
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  private async copyAuctionsToNewFile(record: EventSchema, auctions: string, region: string, ahId: string) {
    await new S3Handler().copy(
      record.object.key,
      `${auctions}/${region}/${ahId}/auctions.json.gz`,
      record.bucket.name)
      .then(() => console.log(`Successfully copied to auctions`))
      .catch(console.error);
  }

  private updateDBEntries(record: EventSchema, region: string, ahId: number, fileName: string, conn: DatabaseUtil) {
    const lastModified = +fileName.split('-')[0],
      fileSize = +(record.object.size / 1000000).toFixed(2),
      url = `${S3Handler.getBucketUrlForRegion(region, `auctions/${region}/${ahId}/${fileName}`)}`;

    return new Promise(async (resolve, reject) => {
      conn.query(RealmQuery.getHouse(ahId))
        .then(async (ah: AuctionHouseStatus) => {
          console.log('updateDBEntries', {
            fileName, lastModified, ah: ah[0]
          });
          Promise.all([
            conn.query(RealmQuery
              .insertNewDumpLogRow(ahId, url, lastModified, ah[0].lastModified, fileSize))
              .catch(console.error),
            conn.query(RealmQuery
              .updateUrl(
                ahId, url, lastModified, fileSize, await this.getDelay(ahId, conn)))
              .then(async () => {
                console.log(`Successfully updated id=${ahId}`);
              })
              .catch(console.error)
          ])
            .then(() => resolve())
            .catch(reject);

        })
        .catch(reject);
    });
  }

  downloadAndSaveAuctionDump(records: EventRecord[]) {
    return new Promise(async (resolve, reject) => {
      for (const record of records) {
        try {
          const s3 = record.s3;
          await new S3Handler().get(s3.bucket.name, s3.object.key)
            .then(async ({Body}) => {
              const splitted = s3.object.key.split('/');
              const [auctions, region, ahId, fileName] = splitted;
              const ahDumpResponse: AuctionResponse = await new GzipUtil().decompress(Body);
              console.log(`Updating id=${ahId}`, ahDumpResponse);
              await Promise.all([
                this.getAndUploadAuctionDump(ahDumpResponse, ahId, region)
              ])
                .catch(console.error);
            })
            .catch(console.error);
        } catch (e) {
        }
      }
      resolve();
    });
  }
}
