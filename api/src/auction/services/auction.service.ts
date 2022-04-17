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
import {StatsService} from './stats.service';
import {RealmService} from '../../realm/service';
import {RealmRepository} from '../../realm/repositories/realm.repository';
import {AuctionHouse} from '../../realm/model';
import {NameSpace} from '../../enums/name-space.enum';
import {HttpResponse} from '../../models/http-response.model';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {GameBuildVersion} from '@shared/enum';

export class AuctionService {
  realmRepository: RealmRepository;

  constructor() {
    this.realmRepository = new RealmRepository();
  }

  async latestDumpPathRequest(connectedId, region: string, realm: string, timestamp: number, gameBuild: GameBuildVersion) {
    return new Promise<any>(async (resolve, reject) => {
      if (region && realm) {
        let apiResponse;

        await AuthHandler.getToken()
          .then(token => BLIZZARD.ACCESS_TOKEN = token)
          .catch(() => console.error('Unable to fetch token'));

        apiResponse = await this.getLatestDumpPath(connectedId, region, gameBuild)
          .then(response => apiResponse = response)
          .catch(() => console.error('Unable to fetch data'));

        resolve(apiResponse);
      } else {
        reject('Realm or region is missing from the request');
      }
    });
  }

  getLatestDumpPath(id: number, region: string, gameBuild: GameBuildVersion = GameBuildVersion.Retail): Promise<AHDumpResponse> {
    const isClassic = gameBuild === GameBuildVersion.Classic;
    return new Promise<AHDumpResponse>((resolve, reject) => {
      const url = new Endpoints().getPath(
        `connected-realm/${id}/auctions${isClassic ? '/index' : ''}`,
        region,
        isClassic ? NameSpace.DYNAMIC_CLASSIC : NameSpace.DYNAMIC_RETAIL
      );
      new HttpClientUtil().get(url, false, {
        'If-Modified-Since': 'Sat, 14 Mar 3000 20:07:10 GMT'
      })
        .then(({headers}) => {
          const newLastModified = headers['last-modified'];
          resolve({
            lastModified: +new Date(newLastModified),
            url: url.replace(`access_token=${BLIZZARD.ACCESS_TOKEN}&`, ''),
            gameBuild,
          });
        })
        .catch(reject);
    });
  }

  private async sendToS3(data: { ahTypeId: number, data: any }, region: string, ahId: number, lastModified: number): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`Sending ${ahId} to S3`);
      new S3Handler().save(
        data.data,
        `auctions/${region}/${ahId}/${data.ahTypeId}/${lastModified}-lastModified.json.gz`,
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

  private downloadDump(url: string, gameBuild: GameBuildVersion, ahTypeId = 0): Promise<{data: any, ahTypeId: number}[]> {
    return new Promise<any>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const fullUrl = `${url}&access_token=${BLIZZARD.ACCESS_TOKEN}`;
      console.log('Full dump URL', fullUrl);
      new HttpClientUtil().get(fullUrl)
        .then(async ({body, headers}: HttpResponse<{auctions: any[]}>) => {
          console.log('Header', headers);
          const result: {data: any, ahTypeId: number}[] = [];
          if (body) {
            if (gameBuild === GameBuildVersion.Classic) {
              for (const ah of body.auctions) {
                await this.downloadDump(ah.key.href, undefined, ah.id)
                  .then(res => result.push(res[0]))
                  .catch(console.error);
              }
            } else {
              const data = body;
              if (data && data.auctions.length) {
                result.push({data, ahTypeId});
              }
            }
            resolve(result);
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

  async updateAllHouses(): Promise<void> {
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
            new Promise((success) => {
              this.updateHouse(house)
                .then(hadUpdate => {
                  if (hadUpdate) {
                    updated++;
                  }
                  success();
                })
                .catch(() => {
                  success();
                });
            })
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
      await this.getLatestDumpPath(house.connectedId, house.region, house.gameBuild)
        .then((r: AHDumpResponse) =>
          ahDumpResponse = r)
        .catch(async e => {
          error = e || {message: 'Could not fetch AH dump'};
          const minutesToNextAttempt = 5;
          const nextUpdateAttemptAppend = 1000 * 60 * minutesToNextAttempt;
          await this.realmRepository.update(house.id, {nextUpdate: +new Date() + nextUpdateAttemptAppend})
            .catch(console.error);
          console.error(`Could not get AH data for ${
            house.id}(${house.region}), trying again in ${minutesToNextAttempt} minutes.`, error);
        });

      /**
       * used to be:  !error  && ahDumpResponse && ahDumpResponse.lastModified > house.lastModified
       * Changed it, since there seemed to be some issues with it.
       * But I'm keeping this comment, in case I find cost issues related to not checking for the dump date vs stored date.
       */
      if (!error) {
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
      this.downloadDump(ahDumpResponse.url, ahDumpResponse.gameBuild)
        .then(async (auctions: {data: any, ahTypeId: number}[]) => {
          if (auctions.length && auctions[0].data.auctions) {
            console.log(`Done downloading for id=${id} (${+new Date() - dumpDownloadStart}ms)`);
            Promise.all(
              auctions.map(newData => this.sendToS3(
                newData, region, id,
                ahDumpResponse.lastModified))
            )
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

  updateStaticS3Data(records: EventRecord[]): Promise<void> {
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

  private processS3Record(record: EventSchema): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!record || !record.object || !record.object.key) {
        resolve();
      }
      const regex = /auctions\/[a-z]{1,4}\/[\d]{1,4}\/[\d]{1,4}\/[\d]{13,999}-lastModified.json.gz/gi;
      if (regex.exec(record.object.key)) {
        const splitted = record.object.key.split('/');
        console.log('Processing S3 auction data update');
        const [auctions, region, ahId, ahTypeId, fileName] = splitted;
        const start = +new Date();
        const lastModified = +fileName.replace(/-lastModified.json.gz/gi, '');
        let house: AuctionHouse;
          await this.realmRepository.getById(+ahId)
            .then(h => house = h)
          .catch(console.error);

        if (house) {
          const fileSize = +(record.object.size / 1000000).toFixed(2),
            url = `${S3Handler.getBucketUrlForRegion(region, `auctions/${region}/${ahId}/${ahTypeId}/${fileName}`)}`;
          console.log(`Checked update and updated realm status in ${+new Date() - start} ms`);
          new StatsService().processRecord(record)
            .then(async () => {
              await this.updateRealmStatus(ahId, lastModified, url, +ahTypeId, fileSize, house.lastRequested)
                .catch(err => console.error('Could not update realm status', err));
              await new RealmService().createLastModifiedFile(+ahId, region)
                .catch(err => console.error('Could not createLastModifiedFile', err));
              resolve();
            })
            .catch(err => {
              console.error(err);
              reject(err);
            });
        } else {
          const msg = `Was trying to update with the same or an older version of the AH dump ${
            house ? house.lastModified : undefined} with ${lastModified}`;
          console.error(msg);
          reject(new Error(msg));
        }
      } else {
        console.log('No match for regex', record.object.key);
        resolve();
      }
    });
  }

  private updateRealmStatus(
    ahId: string,
    lastModified: number,
    url: string,
    ahTypeId: number,
    fileSize: number,
    lastRequested: number
  ): Promise<void> {
    const realmService = new RealmService();

    return new Promise<void>(async (resolve, reject) => {
      let prevData = {};
      console.log('Updating realm status for type', ahTypeId);
      if (ahTypeId > 0) {
        await realmService.getById(+ahId)
          .then(((ah) => {
            if (ah.url) {
              prevData = ObjectUtil.isObject(ah.url) ? ah.url : {};
            }
          }))
          .catch(console.error);
        prevData[ahTypeId] = url;
      }
      realmService.updateLastModified(+ahId, {
        lastModified,
        url: ahTypeId > 0 ? prevData : url,
        size: fileSize,
        lastRequested,
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
      resolve('success');
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
