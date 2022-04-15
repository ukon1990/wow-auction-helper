import {BaseRepository} from '../../repository/base.repository';
import {AWSError} from 'aws-sdk';
import {AuctionHouse} from '../model';
import {RealmStatus} from '../../../../client/src/client/models/realm-status.model';
import {RealmLogRepository} from './realm-log.repository';

export class RealmRepository extends BaseRepository<AuctionHouse> {
  repository: RealmLogRepository;

  constructor() {
    super('wah_auction_houses');
    this.repository = new RealmLogRepository();
  }

  add(data: any): Promise<AWSError | any> {
    return this.put(data);
  }

  getAllAfterTimestamp(timestamp: number): Promise<AuctionHouse[]> {
    return this.getAllAfter(timestamp);
  }

  private connectRealmsFromHouses(houses: AuctionHouse[]) {
    const realms: RealmStatus[] = [];
    houses
      .filter(house => house.url)
      .forEach(house =>
      house.realms.forEach(realm => {
        realms.push({
          id: house.id,
          ahId: house.id,
          region: house.region,
          slug: realm.slug,
          name: realm.name,
          connectedTo: house.realmSlugs.split(','),
          realms: house.realms,
          battlegroup: house.battlegroup,
          locale: realm.locale,
          timezone: realm.timezone,
          url: house.url,
          tsmUrl: house.tsm ? house.tsm.url : undefined,
          lastModified: house.lastModified,
          lastRequested: house.lastRequested,
          nextUpdate: house.nextUpdate,
          size: house.size,
          lowestDelay: house.lowestDelay,
          avgDelay: house.avgDelay,
          highestDelay: house.highestDelay,
          stats: house.stats,
          gameBuild: house.gameBuild
        });
      }));
    return realms;
  }

  getHouseToUpdateTSMFor(): Promise<AuctionHouse[]> {
    return new Promise<AuctionHouse[]>((resolve, reject) => {
      this.getAllAfterTimestamp(0)
        .then(houses =>
          resolve(houses
            .filter((house: AuctionHouse) =>
              house.region === 'eu' || house.region === 'us')
            .sort((a, b) =>
              a.tsm.lastModified - b.tsm.lastModified)))
        .catch(reject);
    });
  }

  getRealmsToUpdate(): Promise<AuctionHouse[]> {
    return this.scan({
      TableName: this.table,
      FilterExpression: '#nextUpdate <= :now OR attribute_not_exists(#nextUpdate)',
      ExpressionAttributeNames: {
        '#nextUpdate': 'nextUpdate',
      },
      ExpressionAttributeValues: {
        ':now': +new Date(),
      }
    });
  }

  getAllRealmsSeparated(): Promise<RealmStatus[]> {
    return new Promise<RealmStatus[]>((resolve, reject) => {
      this.getAllAfterTimestamp(0)
        .then(houses => {
          const realms = this.connectRealmsFromHouses(houses);
          resolve(realms.filter(r => r.url).sort((a, b) =>
            a.slug.localeCompare(b.slug)));
        })
        .catch(reject);
    });
  }

  getRealmsSeparated(id: number): Promise<RealmStatus[]> {
    return new Promise<RealmStatus[]>((resolve, reject) => {
      this.getById(id)
        .then(house => {
          const realms = this.connectRealmsFromHouses([house]);
          resolve(realms.filter(r => r.url));
        })
        .catch(reject);
    });
  }

  getById(id: number): Promise<AuctionHouse> {
    return this.getOne(id);
  }


  getByRegionAndSlug(region: string, slug: string): Promise<AuctionHouse> {
    return new Promise<AuctionHouse>((resolve, reject) => {
      this.client.scan({
        TableName: this.table,
        FilterExpression: '#region = :region and contains(realmSlugs, :realmSlugs)',
        ExpressionAttributeNames: {
          '#region': 'region',
        },
        ExpressionAttributeValues: {
          ':region': region,
          ':realmSlugs': slug
        }
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items[0] as AuctionHouse);
        }
      });
    });
  }

  addDumpLog(id: number, entry: any) {
    return new Promise((resolve, reject) => {
      this.client.put({
          TableName: 'wah_auction_houses_update_log',
          Item: {id, ...entry}
        },
        (error, data) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(data);
        });
    });
  }

  update(id: number, entry: {
    lastModified?: number;
    url?: string | {[key: string]: string};
    size?: number;
    nextUpdate?: number;
    lastHistoryDeleteEvent?: number;
    lastHistoryDeleteEventDaily?: number;
  }) {
    return new Promise<void>((resolve, reject) => {
      this.updateEntry(id, {
        ...entry,
      }, false)
        .then(() => {
          console.log(`Successfully updated ${id} with ${
            new Date(
              entry.lastModified || entry.lastHistoryDeleteEvent || entry.lastHistoryDeleteEventDaily
            ).toUTCString()}`);
          resolve();
        })
        .catch(error => {
          console.error('Could not update', error);
          reject(error);
        });
    });
  }

  realmConnection(fromId: number, toId: number): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      let fromHouse: AuctionHouse, toHouse: AuctionHouse;
      await this.getById(fromId)
        .then(house => {
          fromHouse = house;
        })
        .catch(console.error);
      await this.getById(toId)
        .then(house => {
          toHouse = house;
        })
        .catch(console.error);

      if (fromHouse && toHouse && fromHouse.realms.length && toHouse.realms.length) {
        this.updateEntry(toHouse.id, {
          realms: [
            ...toHouse.realms,
            ...fromHouse.realms
          ],
          realmSlugs: toHouse.realmSlugs + ',' + fromHouse.realmSlugs
        })
          .then((updateOutput) => {
            this.delete(fromHouse.id)
              .then((deleteOutput) => {
                resolve({
                  updateOutput,
                  deleteOutput,
                });
              })
              .catch(error => {
                console.log('Could not delete the item');
                reject(error);
              });
          })
          .catch(error => {
            console.error('Could not update house');
            reject(error);
          });
      } else {
        reject('Nothing to delete');
      }
    });
  }

  getRealmsThatNeedsStatDeletion(timeKey: string): Promise<AuctionHouse[]> {
    const HOUR = 1000 * 60 * 60;
    const notOlderThan = +new Date(+new Date() - HOUR * 24);
    return new Promise<AuctionHouse[]>((resolve, reject) => {
      const filterExpression = `(#${timeKey} < :time OR attribute_not_exists(#${timeKey}))`;
      const attributeNames = {};
      attributeNames['#' + timeKey] = timeKey;

      this.scan({
        TableName: this.table,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: {
          ':time': notOlderThan,
        }
      })
        .then(houses => resolve(
          houses.sort((a, b) => a[timeKey] - b[timeKey])
        ))
        .catch(reject);
    });
  }

  getRealmsThatNeedsTrendUpdate(): Promise<AuctionHouse[]> {
    const HOUR = 1000 * 60 * 60;
    const notOlderThan = +new Date(+new Date() - HOUR * 24);
    return new Promise<AuctionHouse[]>((resolve, reject) => {
      this.scan({
        TableName: this.table,
        FilterExpression:
        '(#lastTrendUpdateInitiation < :time OR attribute_not_exists(#lastTrendUpdateInitiation)) AND ' +
          '(#lastStatsInsert > #lastTrendUpdateInitiation OR attribute_not_exists(#lastStatsInsert))', // Was: lastDailyPriceUpdate
        ExpressionAttributeNames: {
          '#lastTrendUpdateInitiation': 'lastTrendUpdateInitiation',
          '#lastStatsInsert': 'lastStatsInsert',
        },
        ExpressionAttributeValues: {
          ':time': notOlderThan,
        }
      })// TODO: Filter here based on current time and timezone
        .then(houses => resolve(
          houses.sort((a, b) => b.lastTrendUpdateInitiation - a.lastTrendUpdateInitiation)
        ))
        .catch(reject);
    });
  }

  getRealmsThatNeedsDailyPriceUpdate(): Promise<AuctionHouse[]> {
    return this.scan({
      TableName: this.table,
      FilterExpression:
        '(#lastDailyPriceUpdate < :time OR attribute_not_exists(#lastDailyPriceUpdate)) ' +
        'AND (#lastStatsInsert > #lastDailyPriceUpdate OR attribute_not_exists(#lastDailyPriceUpdate))',
      ExpressionAttributeNames: {
        '#lastDailyPriceUpdate': 'lastDailyPriceUpdate',
        '#lastStatsInsert': 'lastStatsInsert',
      },
      ExpressionAttributeValues: {
        ':time': +new Date() - 30 * 60 * 1000 * 12,
      }
    });
  }
}