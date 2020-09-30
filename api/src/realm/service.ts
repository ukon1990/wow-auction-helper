import {DatabaseUtil} from '../utils/database.util';
import {RealmRepository} from './repository';
import {AuctionHouse} from './model';
import {S3Handler} from '../handlers/s3.handler';

export class RealmService {
  private repository: RealmRepository;

  constructor() {
    this.repository = new RealmRepository();
  }

  updateLastRequested(id: number, lastRequested: number): Promise<any> {
    return this.repository.updateEntry(id, {id, lastRequested});
  }

  updateLastRequestedWithRegionAndSlug(region: string, slug: string, lastRequested: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.repository.getByRegionAndSlug(region, slug)
        .then((realm: AuctionHouse) => {
          if (realm) {
            this.updateLastRequested(realm.id, +lastRequested)
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
    url: string;
    size: number;
  }): Promise<any> {
    return this.repository.update(id, {...entry, id});
  }

  updateAllRealmStatuses(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.repository.getAllRealmsSeparated()
        .then(realms => {
          Promise.all(['eu', 'us', 'tw', 'kr']
            .map(region =>
              new S3Handler().save(realms, `auctions/${region}/status.json.gz`, {url: '', region})
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
}
