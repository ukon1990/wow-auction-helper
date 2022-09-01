import {RealmRepository} from './repositories/realm.repository';
import {AuctionHouse, ConnectedRealmAPI} from './model';
import {S3Handler} from '../handlers/s3.handler';
import {RealmLogRepository} from './repositories/realm-log.repository';
import {HttpClientUtil} from '../../utils/http-client.util';
import {Endpoints} from '../../utils/endpoints.util';
import {NameSpace} from '../../enums/name-space.enum';
import {AuthHandler} from '../handlers/auth.handler';
import {BLIZZARD} from '../../secrets';
import {HttpResponse} from '../../models/http-response.model';
import {TextUtil} from '@ukon1990/js-utilities';
import {DynamoDbReturnValue} from '../../enums/dynamo-db-return-value.enum';
import {GameBuildVersion} from '../../shared/enum';
import {AuctionUpdateLog} from '../../shared/models';

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
            // Setting the delay to 119 as a max, in case of newly activated realms
            if (delay.lowestDelay < 60 || delay.lowestDelay > 120) {
              delay.lowestDelay = 60;
            }
            const nextUpdate = entry.lastModified + delay.lowestDelay * minute;
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
    const day = hour * 24;
    return lastRequested <= +new Date() - day * 14;
  }

  updateAllRealmStatuses(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.repository.getAllRealmsSeparated()
        .then(({realms, regional}) => {
          Promise.all(['eu', 'us', 'tw', 'kr']
            .map(region =>
              Promise.all([
                new S3Handler().save(realms, `status/${region}/all.json.gz`, {url: '', region})
                  .catch(console.error),
                new S3Handler().save(regional[region], `status/${region}/regional.json.gz`, {url: '', region})
                  .catch(console.error),
              ])
            )
          ).then(() => resolve())
            .catch(reject);
        })
        .catch(reject);
    });
  }



  async createLastModifiedFile(ahId: number, region: string): Promise<void> {
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
    const http = new HttpClientUtil(30_000);
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
              // realms.push(processedRealm);
              realms.push(body);
              // await this.repository.add(processedRealm);
            } catch (error) {
              console.error(`Realm not found for ${realm.href}`, error);
            }
          }

          resolve(realms);
        })
        .catch(reject);
    });
  }

  correctIncorrectAhIds() {
    return new Promise<any>(async (resolve) => {
      const list = [];
      const map = new Map<string, any>();
      const mapConnectedId = new Map<number, any>();
      const mapSlugs = new Map<string, any>();
      const savedRealms = await this.repository.getAll();
      const correctIdMap = new Map<number, any>();
      const correct = [];
      savedRealms.forEach(realm => {
        if (!!realm.gameBuild) {
          return;
        }
        const customId = realm.realms.map(r => r.id).sort((a, b) => a - b).join(',');
        map.set(customId, realm);
        mapSlugs.set(realm.realmSlugs, realm);
        mapConnectedId.set(realm.connectedId, realm);

        if (realm.id !== realm.connectedId) {
          correctIdMap.set(realm.id, realm);
          correct.push(realm);
        }
      }); // tempRealmFile
      [].forEach(async realm => {
        const customId = realm.realms.map(r => r.id).sort((a, b) => a - b).join(',');
        const slugId = realm.realms.map(r => r.slug).sort().join(',');
        const updatedRealm = map.get(customId) || mapSlugs.get(slugId);
        if (updatedRealm && !correctIdMap.has(realm.ahId)) {
          updatedRealm.id = realm.ahId;
          updatedRealm.stats = realm.stats;
          list.push(updatedRealm);
          console.log('Deleting', updatedRealm.connectedId, 'Adding', updatedRealm.id);
          // await this.repository.delete(updatedRealm.connectedId);
          // await this.repository.add(updatedRealm);

        }
      });

      resolve(list);
    });
  }

  updateActiveRealms() {
    return new Promise<any>(async (resolve, reject) => {
      const regions = ['eu', 'us', 'kr', 'tw'];
      Promise.all([
        ...regions.map(region => this.getAllRealmsFromAPI(region, NameSpace.DYNAMIC_CLASSIC)),
        ...regions.map(region => this.getAllRealmsFromAPI(region, NameSpace.DYNAMIC_RETAIL))
      ])
        .then(resolve)
        .catch(reject);
    });
  }
}