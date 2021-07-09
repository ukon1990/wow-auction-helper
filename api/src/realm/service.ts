import {DatabaseUtil} from '../utils/database.util';
import {RealmRepository} from './repositories/realm.repository';
import {AuctionHouse, ConnectedRealmAPI} from './model';
import {S3Handler} from '../handlers/s3.handler';
import {AuctionUpdateLog} from '../models/auction/auction-update-log.model';
import {RealmLogRepository} from './repositories/realm-log.repository';
import {HttpClientUtil} from '../utils/http-client.util';
import {Endpoints} from '../utils/endpoints.util';
import {NameSpace} from '../enums/name-space.enum';
import {AuthHandler} from '../handlers/auth.handler';
import {BLIZZARD} from '../secrets';
import {HttpResponse} from '../models/http-response.model';
import {GameBuildVersion} from '../../../client/src/client/utils/game-build.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {DynamoDbReturnValue} from "../enums/dynamo-db-return-value.enum";

export class RealmService {
  private repository: RealmRepository;
  private logRepository: RealmLogRepository;

  constructor() {
    this.repository = new RealmRepository();
    this.logRepository = new RealmLogRepository();
  }

  getById(ahId: number): Promise<AuctionHouse> {
    return this.repository.getById(ahId);
  }

  getUpdateLog(ahId: number, hours: number = 24): Promise<AuctionUpdateLog> {
    const fromDate = +new Date() - hours * 60 * 60 * 1000;
    return new Promise<AuctionUpdateLog>((resolve, reject) => {
      this.logRepository.getByIdAfter(ahId, fromDate)
        .then(res => resolve(new AuctionUpdateLog(res)))
        .catch(reject);
    });
  }

  updateLastRequested(id: number, lastRequested?: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!lastRequested) {
        await this.repository.getById(id)
          .then(house => {
            lastRequested = house.lastRequested;
          })
          .catch(console.error);
      }

      const isInactive = this.isHouseInactive(lastRequested);
      const nextUpdate = isInactive ? +new Date() : undefined;
      const updatedValue = {id, lastRequested: +new Date()};
      if (nextUpdate) {
        updatedValue['nextUpdate'] = nextUpdate;
      }
      this.repository.updateEntry(id, updatedValue, undefined, DynamoDbReturnValue.NONE)
        .then(resolve)
        .catch(reject);
    });
  }

  updateLastRequestedWithRegionAndSlug(region: string, slug: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.repository.getByRegionAndSlug(region, slug)
        .then((realm: AuctionHouse) => {
          if (realm) {
            this.updateLastRequested(realm.id, realm.lastRequested)
              .then(resolve)
              .catch(reject);
          } else {
            console.error('No realm found with slug', slug, region);
            resolve();
          }
        })
        .catch(reject);
    });
  }

  update(id: number, data: any): Promise<any> {
    return this.repository.updateEntry(id, {
      ...data
    });
  }

  addUpdateDumpLog(id: number, entry: {
    url: string;
    lastModified: number;
    size: number;
  }): Promise<any> {
    return this.repository.addDumpLog(id, entry);
  }

  updateLastModified(id: number, entry: {
    lastModified: number;
    url: string | {[key: string]: string};
    size: number;
    lastRequested: number;
  }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const minute = 60 * 1000;
      const hour = minute * 60;
      const isInactiveHouse = this.isHouseInactive(entry.lastRequested);
      if (isInactiveHouse) {
        const nextUpdate = +new Date() + hour * 6;
        this.repository.update(id, {
          lastModified: entry.lastModified,
          url: entry.url,
          size: entry.size,
          nextUpdate,
        })
          .then(resolve)
          .catch(reject);
      } else {
        this.logRepository.getUpdateDelays(id)
          .then(delay => {
            // Setting the delay to 115 as a max, in case of newly activated realms
            const lowestDelay = (delay.lowestDelay > 120 ? 60 : delay.lowestDelay);
            const nextUpdate = entry.lastModified + lowestDelay * minute;
            this.repository.update(id, {
              lastModified: entry.lastModified,
              url: entry.url,
              size: entry.size,
              ...delay,
              nextUpdate,
            })
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      }
    });
  }

  private isHouseInactive(lastRequested: number) {
    const minute = 60 * 1000;
    const hour = minute * 60;
    return lastRequested <= +new Date() - hour * 24 * 14;
  }

  updateAllRealmStatuses(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.repository.getAllRealmsSeparated()
        .then(realms => {
          Promise.all(['eu', 'us', 'tw', 'kr']
            .map(region =>
              new S3Handler().save(realms, `status/${region}/all.json.gz`, {url: '', region})
                .catch(console.error))
          ).then(() => resolve())
            .catch(reject);
        })
        .catch(reject);
    });
  }

  extractRDSDataToDynamoDB(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      new DatabaseUtil().query(`
          SELECT ahId,
                 connectedId,
                 region,
                 slug,
                 name,
                 realm.id         as realmId,
                 battlegroup,
                 locale,
                 timezone,
                 ah.url           as url,
                 ah.lastModified  as lastModified,
                 lowestDelay,
                 avgDelay,
                 highestDelay,
                 ah.size          as size,
                 tsm.url          as tsmUrl,
                 tsm.lastModified as tsmLastModified,
                 ah.autoUpdate    as autoUpdate,
                 size,
                 firstRequested,
                 lastRequested,
                 lastHistoryDeleteEvent
          FROM auction_house_realm AS realm
                   LEFT OUTER JOIN auction_houses AS ah
                                   ON ah.id = realm.ahId
                   LEFT OUTER JOIN tsmDump AS tsm
                                   ON tsm.id = realm.ahId
          ORDER BY name;`)
        .then(async rows => {
          const map = new Map<number, any>();
          const list = [];
          /*
          await this.repository.getAllAfterTimestamp(0)
            .then(async (res: any[]) => {
              console.log('Num of items', res.length);
              await Promise.all(res.map(r => this.repository.delete(r.id)
                .catch(err => console.error('Res', r.id, err))))
                .catch(console.error);
            })
            .catch(console.error);*/

          rows.forEach(row => {
            if (!map.has(row.ahId)) {
              map.set(row.ahId, {
                id: row.ahId,
                connectedId: row.connectedId,
                realmSlugs: '',
                region: row.region,
                battlegroup: row.battlegroup,
                realms: [],
                lastModified: row.lastModified,
                url: row.url,
                size: row.size,
                tsm: {
                  url: row.tsmUrl,
                  lastModified: row.tsmLastModified || 0
                },
                lowestDelay: row.lowestDelay || 0,
                avgDelay: row.avgDelay || 0,
                highestDelay: row.highestDelay || 0,
                autoUpdate: !!row.autoUpdate,
                firstRequested: row.firstRequested || 0,
                lastRequested: row.lastRequested || 0,
                lastHistoryDeleteEvent: row.lastHistoryDeleteEvent || 0,
              });
              list.push(map.get(row.ahId));
            }
            map.get(row.ahId).realms.push({
              id: row.realmId,
              slug: row.slug,
              name: row.name,
              timezone: row.timezone,
              locale: row.locale,
            });
            map.get(row.ahId).realmSlugs = map.get(row.ahId).realms.map(r => r.slug).join(',');
          });

          Promise.all(
            list.map(ah => this.repository.add(ah).catch(e => console.error(ah, e)))
          )
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  async createLastModifiedFile(ahId: number, region: string) {
    const start = +new Date();
    return new Promise(async (resolve, reject) => {
      const s3 = new S3Handler();
      let house: AuctionHouse;
      await this.getById(ahId)
        .then(h => house = h)
        .catch(console.error);
      this.repository.getRealmsSeparated(ahId)
        .then(realms => {
          s3.save(
            house,
            `status/${region}/${house.id}.json.gz`, {url: '', region})
            .then(uploaded => {
              console.log(`Timestamp uploaded for ${ahId} @ ${uploaded.url} in ${+new Date() - start} ms`);
            })
            .catch(error => {
              console.error(error);
            })
            .then(resolve)
            .catch(reject);
        })
        .catch(error => {
          console.error(error);
          resolve();
        });
    });
  }

  getAllRealmsFromAPI(region: string, nameSpace: NameSpace.DYNAMIC_CLASSIC | NameSpace.DYNAMIC_RETAIL): Promise<any> {
    const http = new HttpClientUtil();
    return new Promise<any>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints().getPath(`connected-realm/`, region, nameSpace);
      console.log('URL', url);
      http.get(url)
        .then(async ({body: parentBody}: HttpResponse<{connected_realms: {href: string}[]}>) => {
          const realms = [];

          for (const realm of parentBody.connected_realms) {
            try {
              const {body}: HttpResponse<ConnectedRealmAPI> = await http.get(
                `${realm.href}&access_token=${BLIZZARD.ACCESS_TOKEN}`);
              const locales = body.realms[0].locale;
              const firstRealmLocale = `${locales[0]}${locales[1]}_${locales[2]}${locales[3]}`;
              const {body: locale}: HttpResponse<ConnectedRealmAPI> = await http.get(
                `${realm.href}&access_token=${BLIZZARD.ACCESS_TOKEN}&locale=${firstRealmLocale}`);

              const processedRealm: AuctionHouse = {
                id: body.id,
                connectedId: body.id,
                autoUpdate: true,
                realmSlugs: body.realms.map(({slug}) => slug).join(','),
                realms: locale.realms.map(r => ({
                  id: r.id,
                  slug: r.slug,
                  name: r.name,
                  timezone: r.timezone,
                  locale: `${r.locale[0]}${r.locale[1]}_${r.locale[2]}${r.locale[3]}`,
                })),
                region,
                gameBuild: TextUtil.contains(nameSpace, 'classic') ?
                  GameBuildVersion.Classic : GameBuildVersion.Retail,
              };
              realms.push(processedRealm);
              await this.repository.add(processedRealm);
            } catch (error) {
              console.error(`Realm not found for ${realm.href}`, error);
            }
          }

          resolve(realms);
        })
        .catch(reject);
    });
  }
}
