import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {AHDumpResponse} from '../../models/auction/ah-dump-response.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {BLIZZARD} from '../../secrets';
import {Endpoints} from '../../utils/endpoints.util';
import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {RealmQuery} from '../../queries/realm.query';
import {HttpClientUtil} from '../../utils/http-client.util';
import {AuctionUpdateLog} from '../../models/auction/auction-update-log.model';
import {RealmHandler} from '../../handlers/realm.handler';
import {EventRecord, EventSchema} from '../../models/s3/event-record.model';
import {GzipUtil} from '../../utils/gzip.util';
import {AuctionHouseStatus} from '../../../../client/src/client/modules/auction/models/auction-house-status.model';
import {AuctionResponse} from '../../models/auction/auctions-response';
import {AuctionTransformerUtil} from '../utils/auction-transformer.util';
import {StatsService} from './stats.service';
import {LogRepository} from '../../logs/repository';
import {LogService} from '../../logs/log.service';
import {GlobalStatus} from '../../logs/model';

const request: any = require('request');
const PromiseThrottle: any = require('promise-throttle');

export class AuctionService {

  async getUpdateLog(ahId: number, hours: number = 24, conn = new DatabaseUtil()): Promise<AuctionUpdateLog> {
    const fromDate = +new Date() - hours * 60 * 60 * 1000;
    return new Promise<AuctionUpdateLog>((resolve, reject) => {
      conn.query(RealmQuery.getUpdateHistoryForRealm(ahId, fromDate))
        .then(res => resolve(new AuctionUpdateLog(res)))
        .catch(reject);
    });
  }

  async latestDumpPathRequest(connectedId, region: string, realm: string, timestamp: number) {
    return new Promise<any>(async (resolve, reject) => {
      if (region && realm) {
        let apiResponse;

        await AuthHandler.getToken()
          .then(token => BLIZZARD.ACCESS_TOKEN = token)
          .catch(() => console.error('Unable to fetch token'));

        apiResponse = await this.getLatestDumpPath(connectedId, region)
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
          .then(({body}) => resolve({auctions: AuctionTransformerUtil.transform(body)}))
          .catch(reject);
      } else {
        reject('Could not get the auction dump, no URL were provided');
      }
    });
  }

  getLatestDumpPath(id: number, region: string): Promise<AHDumpResponse> {
    return new Promise<AHDumpResponse>((resolve, reject) => {
      const url = new Endpoints().getPath(`connected-realm/${id}/auctions`, region, 'dynamic');
      new HttpClientUtil().get(url, false, {
        'If-Modified-Since': 'Sat, 14 Mar 3000 20:07:10 GMT'
      })
        .then(({headers}) => {
          const newLastModified = headers['last-modified'];
          resolve({
            lastModified: +new Date(newLastModified),
            url: url.replace(`access_token=${BLIZZARD.ACCESS_TOKEN}&`, '')
          });
        })
        .catch(reject);
    });
  }

  getLatestDumpPathOld(region: string, realm: string): Promise<AHDumpResponse> {
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
    return new Promise<any>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const fullUrl = `${url}&access_token=${BLIZZARD.ACCESS_TOKEN}`;
      console.log('Full dump URL', fullUrl);
      new HttpClientUtil().get(fullUrl)
        .then(({body, headers}) => {
          console.log('Header', headers);
          if (body) {
            const data = {auctions: AuctionTransformerUtil.transform(body)};
            if (data && data.auctions.length) {
              resolve(data);
            }
          } else {
            reject({
              message: 'The body was empty, so there is likely no new data',
              url
            });
          }
        })
        .catch(err => {
          console.error('Could not download AH dump with url:', url, err);
          reject(err);
        });
    });
  }

  async updateAllHouses(region: string, conn: DatabaseUtil): Promise<any> {
    await AuthHandler.getToken()
      .catch(console.error);
    console.log('Starting AH updates');

    return new Promise(async (resolve, reject) => {
      if (!BLIZZARD.ACCESS_TOKEN) {
        reject('Blizzard Auth API is down');
        return;
      }

      new LogService(undefined, conn).getGlobalStatus()
        .then((status: GlobalStatus) => {
        console.log('Num of Active queries', status.Threads_connected);
        if (status.Threads_connected < 30) {
          conn.query(RealmQuery.selectAllUpdatableRealms())
            .then(async rows => {
              const basePerSecond = 1,
                rps = rows.length / (50 - 2),
                requestsPerSecond = rows.length > 10 ? rps || basePerSecond : basePerSecond;
              const promiseThrottle = new PromiseThrottle({
                  requestsPerSecond,
                  promiseImplementation: Promise
                }),
                promises = [];
              console.log(`Updating ${rows.length} houses.`);


              rows.forEach(row => {
                this.addUpdateHousePromise(promises, promiseThrottle, row);
              });

              await Promise.all(promises)
                .then(() =>
                  console.log('Done initiating AH updates'))
                .catch(console.error);

              resolve({
                message: `Updating ${rows.length} houses.`,
                rows
              });
            })
            .catch(reject);
        } else {
          console.error('Too many active connections: ', status.Threads_connected);
          reject('Too many active queries');
        }
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

  private addUpdateHousePromise(promises: Promise<any>[], promiseThrottle, row) {
    promises.push(
      promiseThrottle.add(this.updateHouse.bind(this, row)));
  }

  async updateHouseRequest(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body);

    await AuthHandler.getToken()
      .catch(console.error);

    await this.updateHouse(body)
      .then(() => {
      })
      .catch(console.error);

    Response.send({
      message: 'started updateHouseRequest',
      request: body
    }, callback);
  }

  private async updateHouse({id, connectedId, region, lastModified}): Promise<any> {
    let error, ahDumpResponse: AHDumpResponse;
    return new Promise<any>(async (resolve, reject) => {
      const startGetDumpPath = +new Date();
      await this.getLatestDumpPath(connectedId, region)
        .then((r: AHDumpResponse) =>
          ahDumpResponse = r)
        .catch(e => {
          error = e;
        });
      console.log(`Fetching ah dump url took ${+new Date() - startGetDumpPath}ms`, ahDumpResponse);

      if (!error && ahDumpResponse && ahDumpResponse.lastModified > lastModified) {
        console.log('Starting upload');
        new S3Handler().save(ahDumpResponse, `auctions/${region}/${id}/dump-path.json.gz`,
          {region})
          .then((res) => {
            console.log('Successfully uploaded:', id);
            resolve();
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      } else if (error) {
        console.error(`Could not update id=${id}`, error);
        reject(error);
      } else {
        resolve();
      }
    });
  }

  getAndUploadAuctionDump(ahDumpResponse: AHDumpResponse, id, region) {
    const dumpDownloadStart = +new Date();
    console.log(`Downloading dump for ${id} with url=${ahDumpResponse.url}`);
    return new Promise((resolve, reject) => {
      this.downloadDump(ahDumpResponse.url)
        .then(async (body) => {
          if (body && body.auctions) {
            console.log(`Done downloading for id=${id} (${+new Date() - dumpDownloadStart}ms)`);
            this.sendToS3(
              body, region, id,
              ahDumpResponse.lastModified)
              .then(async (res) => {
                console.log('Successfully uploaded to bucket for id=', id);
                resolve(res);
              })
              .catch(async err => {
                console.error('Could not upload to s3', err);
              });
          } else {
            const message = 'The body was empty.';
            console.log(message);
            reject({message});
          }
        })
        .catch(e => {
          console.error('downloadDump', e);
          reject(e);
        });
    });
  }

  private async getDelay(id, conn = new DatabaseUtil()) {
    const {minTime, avgTime, maxTime} = await this.getUpdateLog(id, 72, conn);

    const lowestDelay = minTime > 120 ? 120 : minTime;
    return {
      lowest: lowestDelay, avg: avgTime, highest: maxTime
    };
  }

  private async createLastModifiedFile(ahId: number, region: string, conn: DatabaseUtil = new DatabaseUtil()) {
    const start = +new Date();
    return new Promise((resolve, reject) => {
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 100,
        promiseImplementation: Promise
      }),
        promises = [];
      RealmQuery.getAllRealmsForHouse(ahId, conn)
        .then(async rows => {
          if (rows && rows.length) {
            rows.forEach(realm => {
              if (realm.connectedTo) {
                realm.connectedTo = (realm.connectedTo as string).split(',');
              }

              promises.push(promiseThrottle.add(() =>
                  new S3Handler().save(realm, `auctions/${region}/${realm.slug}.json.gz`, {url: '', region})
                    .then(uploaded => {
                      console.log(`Timestamp uploaded for ${ahId} @ ${uploaded.url} in ${+new Date() - start} ms`);
                    })
                    .catch(error => {
                      console.error(error);
                    })
                )
              );
            });
            Promise.all(promises)
              .then(resolve)
              .catch(reject);
          } else {
            resolve();
          }
        })
        .catch(error => {
          console.error(error);
          resolve();
        });
    });
  }

  private async updateAllStatuses(region: string, conn: DatabaseUtil) {
    const start = +new Date();
    return new Promise((resolve, reject) => {
      new RealmHandler().getAllRealms(conn)
        .then((realms) => {
          new S3Handler().save(realms, `auctions/${region}/status.json.gz`, {url: '', region})
            .then(() => {
              console.log(`Updated realm statuses in ${+new Date() - start} ms`);
              resolve();
            })
            .catch(resolve);
        })
        .catch(resolve);
    });
  }

  updateStaticS3Data(records: EventRecord[], conn: DatabaseUtil) {
    return new Promise(async (resolve, reject) => {
      const promises = [];
      for (const record of records) {
        promises.push(this.processS3Record(record.s3, conn));
      }
      Promise.all(promises)
        .then(() => {
          resolve();
          console.log(`Successfully processed ${records.length} records.`);
        })
        .catch(err => {
          console.error('One or more of the records failed', err);
          reject();
        });
    });
  }

  private processS3Record(record: EventSchema, conn: DatabaseUtil) {
    return new Promise(async (resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const regex = /auctions\/[a-z]{2}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [auctions, region, ahId, fileName] = splitted;
        const start = +new Date();
        const s3 = new S3Handler();
        const lastModified = +fileName.replace(/-lastModified.json.gz/gi, '');
        let previousLastModified;

        await s3.getAndDecompress(record.bucket.name, `auctions/${region}/${ahId}/prev-dump-path.json.gz`)
          .then(({lastModified: prevTime}) => {
            console.log('Prev last mod was ', prevTime);
            previousLastModified = prevTime;
          })
          .catch(console.error);
        if (previousLastModified && previousLastModified === lastModified) {
          console.log(`The house ${ahId} has already been updated this period`, lastModified, previousLastModified.lastModified);
          resolve();
          return;
        }
        conn.enqueueHandshake()
          .then(() => {
            console.log(`Checked update and updated realm status in ${+new Date() - start} ms`);
            Promise.all([
              this.updateDBEntries(record, region, +ahId, fileName, conn)
                .catch((error) => console.error('Could not update DB entries', error)),,
              new StatsService().processRecord(record, conn)
                .catch(err => {
                  console.error('Could not processAuctions', err);
                }),
            ])
              .then(async () => {
                const base = `auctions/${region}/${ahId}/`;
                await s3.copy(`${base}dump-path.json.gz`, `${base}prev-dump-path.json.gz`, record.bucket.name)
                  .catch(error => console.error('Could not copy the dump file', error));
                resolve();
              })
              .catch(err => {
                console.error(err);
                reject(err);
              });
          })
          .catch(console.error);
      } else {
        resolve();
      }
    });
  }

  updateStatuses(region: string, ahId: number, conn: DatabaseUtil): Promise<any> {
    return Promise.all([
      this.updateAllStatuses(region, conn)
        .catch(err => console.error('Could not updateAllStatuses', err)),
      this.createLastModifiedFile(+ahId, region, conn)
        .catch(err => console.error('Could not createLastModifiedFile', err))
    ]);
  }

  private updateDBEntries(record: EventSchema, region: string, ahId: number, fileName: string, conn: DatabaseUtil) {
    const lastModified = +fileName.split('-')[0],
      fileSize = +(record.object.size / 1000000).toFixed(2),
      url = `${S3Handler.getBucketUrlForRegion(region, `auctions/${region}/${ahId}/${fileName}`)}`;

    return new Promise(async (resolve, reject) => {
      let hasHadError = false;
      conn.query(RealmQuery.getHouse(ahId))
        .then(async (ah: AuctionHouseStatus) => {
          Promise.all([
            conn.query(RealmQuery
              .insertNewDumpLogRow(ahId, url, lastModified, ah[0].lastModified, fileSize))
              .catch(error => {
                hasHadError = true;
                console.log(error);
              }),
            conn.query(RealmQuery
              .updateUrl(
                ahId, url, lastModified, fileSize, await this.getDelay(ahId, conn)))
              .then(async () => {
                console.log(`Successfully updated id=${ahId}`);
              })
              .catch(error => {
                hasHadError = true;
                console.log(error);
              })
          ])
            .then(() => {
              if (hasHadError) {
                reject();
              } else {
                this.updateStatuses(region, ahId, conn)
                  .then(resolve)
                  .catch(reject);
              }
            })
            .catch((error) => {
              console.error('An error occured in updateDBEntries', error);
              reject(error);
            });

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
              const [_, region, ahId, fileName] = splitted;
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
