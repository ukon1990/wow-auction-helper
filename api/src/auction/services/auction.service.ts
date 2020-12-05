import {APIGatewayEvent, Callback} from 'aws-lambda';
import {Response} from '../../utils/response.util';
import {AHDumpResponse} from '../../models/auction/ah-dump-response.model';
import {AuthHandler} from '../../handlers/auth.handler';
import {BLIZZARD} from '../../secrets';
import {Endpoints} from '../../utils/endpoints.util';
import {S3Handler} from '../../handlers/s3.handler';
import {DatabaseUtil} from '../../utils/database.util';
import {RealmQuery} from '../../queries/realm.query';
import {HttpClientUtil} from '../../utils/http-client.util';
import {RealmHandler} from '../../handlers/realm.handler';
import {EventRecord, EventSchema} from '../../models/s3/event-record.model';
import {GzipUtil} from '../../utils/gzip.util';
import {AuctionResponse} from '../../models/auction/auctions-response';
import {AuctionTransformerUtil} from '../utils/auction-transformer.util';
import {StatsService} from './stats.service';
import {RealmService} from '../../realm/service';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {AuctionHouse} from '../../realm/model';

export class AuctionService {
  realmRepository: RealmRepository;

  constructor() {
    this.realmRepository = new RealmRepository();
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

  async updateAllHouses(): Promise<any> {
    await AuthHandler.getToken()
      .catch(console.error);
    console.log('Starting AH updates');

    return new Promise(async (resolve, reject) => {
      if (!BLIZZARD.ACCESS_TOKEN) {
        reject('Blizzard Auth API is down');
        return;
      }

      this.realmRepository.getRealmsToUpdate()
        .then((houses: AuctionHouse[]) => {
          console.log(`Updating ${houses.length} houses.`);
          let updated = 0;
          Promise.all(houses.map(house =>
            this.updateHouse(house)
              .then(hadUpdate => {
                if (hadUpdate) {
                  updated++;
                }
              })
              .catch(console.error)
          ))
            .then(() => {
              console.log(`Done initiating AH updates ${updated}/${houses.length}`);
              resolve();
            })
            .catch(reject);
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

  private async updateHouse(house: AuctionHouse): Promise<boolean> {
    let error, ahDumpResponse: AHDumpResponse;
    return new Promise<any>(async (resolve, reject) => {
      const startGetDumpPath = +new Date();
      await this.getLatestDumpPath(house.connectedId, house.region)
        .then((r: AHDumpResponse) =>
          ahDumpResponse = r)
        .catch(e => {
          error = e;
        });

      if (!error && ahDumpResponse && ahDumpResponse.lastModified > house.lastModified) {
        console.log('Starting upload');
        new S3Handler().save(ahDumpResponse, `auctions/${house.region}/${house.id}/dump-path.json.gz`,
          {region: house.region})
          .then((res) => {
            console.log('Successfully uploaded:', house.id);
            resolve(true);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      } else if (error) {
        console.error(`Could not update id=${house.id}`, error);
        reject(error);
      } else {
        resolve(false);
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

  updateStaticS3Data(records: EventRecord[]) {
    return new Promise(async (resolve, reject) => {
      const promises = [];
      for (const record of records) {
        promises.push(this.processS3Record(record.s3));
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

  private processS3Record(record: EventSchema) {
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
        const lastModified = +fileName.replace(/-lastModified.json.gz/gi, '');

        const fileSize = +(record.object.size / 1000000).toFixed(2),
          url = `${S3Handler.getBucketUrlForRegion(region, `auctions/${region}/${ahId}/${fileName}`)}`;
        console.log(`Checked update and updated realm status in ${+new Date() - start} ms`);
        Promise.all([
          this.updateRealmStatus(ahId, lastModified, url, fileSize),
          new StatsService().processRecord(record)
            .catch(err => {
              console.error('Could not processAuctions', err);
            }),
        ])
          .then(async () => {
            await new RealmService().createLastModifiedFile(+ahId, region)
              .catch(err => console.error('Could not createLastModifiedFile', err));
            resolve();
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });
      } else {
        resolve();
      }
    });
  }

  private updateRealmStatus(ahId: string, lastModified: number, url: string, fileSize: number): Promise<void> {
    const realmService = new RealmService();

    return new Promise<void>((resolve, reject) => {
      realmService.updateLastModified(+ahId, {
        lastModified,
        url,
        size: fileSize,
      })
        .then(async () => {
          realmService.addUpdateDumpLog(+ahId, {
            url,
            lastModified,
            size: fileSize
          }).catch(console.error);

          resolve();
        })
        .catch(error => {
          console.error('updateRealmStatus', error);
          reject(error);
        });
    });
  }

  updateStatuses(region: string, ahId: number, conn: DatabaseUtil): Promise<any> {
    return Promise.all([
      this.updateAllStatuses(region, conn)
        .catch(err => console.error('Could not updateAllStatuses', err))
    ]);
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

  generateDataModel(url: string): Promise<any> {
    const getStructure = (obj, existing: any = {}) => {
      Object.keys(obj).forEach(key => {
        switch (typeof obj[key]) {
          case 'object':
            if (Array.isArray(obj[key])) {
              let childObj = {
                isArray: true,
              };
              obj[key].forEach(child => {
                childObj = {
                  ...childObj,
                  ...getStructure(child, childObj)
                };
              });
              existing[key] = childObj;
            } else {
              existing[key] = getStructure(obj[key], existing[key]);
            }
            break;
          default:
            if (obj[key]) {
              existing[key] = typeof obj[key];
            } else {
              existing['id'] = typeof obj;
            }
            break;
        }
      });
      return existing;
    };

    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const fullUrl = `${url}&access_token=${BLIZZARD.ACCESS_TOKEN}`;
      console.log('Full dump URL', fullUrl);
      new HttpClientUtil().get(fullUrl)
        .then(({body, headers}) => {
          const result = {};
          body.auctions.forEach(row => {
            getStructure(row, result);
          });
          resolve(result);
        })
        .catch(reject);
    });
  }
}
