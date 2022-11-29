import {RDSItemRepository} from './repository';
import {DatabaseUtil} from '../../utils/database.util';
import {BLIZZARD, isOffline} from '../../secrets';
import {Item} from '../../shared/models';
import {ItemQuery} from '../../queries/item.query';
import {ItemUtil} from '../../utils/item.util';
import {QueryIntegrity} from '../../queries/integrity.query';
import {RDSQueryUtil} from '../../utils/query.util';
import {LocaleUtil} from '../../utils/locale.util';
import {WoWHeadUtil} from '../../utils/wowhead.util';
import {WoWDBItem, WoWHead} from '@models/item';
import {UpdatesService} from '../updates/service';
import {NameSpace} from '../../enums/name-space.enum';
import {UpdateProgressModel} from '@models/update';
import {DateUtil} from '@ukon1990/js-utilities';

// const PromiseThrottle: any = require('promise-throttle');

export class ItemServiceV2 {
  private readonly repository = new RDSItemRepository();
  // private readonly updateProgressRepository = new ProgressUpdateRepository();
  private table: string;
  private localeTable: string;
  private nameSpace: NameSpace;

  constructor(private isClassic = false) {
  this.table = isClassic ? 'itemsClassic' : 'items';
  this.localeTable = isClassic ? 'itemClassic_name_locale' : 'item_name_locale';
  this.nameSpace = isClassic ? NameSpace.STATIC_CLASSIC : NameSpace.STATIC_RETAIL;
  }

  findMissingItemsAndImport(clientId?: string, clientSecret?: string): Promise<UpdateProgressModel> {
    if (clientId) {
      BLIZZARD.CLIENT_ID = clientId;
    }
    if (clientSecret) {
      BLIZZARD.CLIENT_SECRET = clientSecret;
    }

    return new Promise<UpdateProgressModel>((resolve, reject) => {
      const db = new DatabaseUtil(false);
      console.log('Checking for new items to add');
      (this.isClassic ? this.repository.findMissingItemsFromAuctionsClassic(db) : this.repository.findMissingItemsFromAuctions(db))
        .then(ids => {
          console.log(`There are ${ids.length} new items to add.`);
          this.addOrUpdateItemsByIds(ids, db)
            .then((response) => {
              db.end();
              resolve(response);
            })
            .catch(err => {
              db.end();
              reject(err);
            });
        })
        .catch(err => {
          db.end();
          reject(err);
        });
    });
  }

  updateExistingItemsForCurrentExpansion(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const db = new DatabaseUtil(false);
      this.repository.getAllItemIdsFromCurrentExpansion(db)
        .then(ids => {
          console.log('Items to update', ids.length);
          this.addOrUpdateItemsByIds(ids, db)
            .then(() => {
              db.end();
              resolve();
            })
            .catch(error => {
              db.end();
              reject(error);
            });
        })
        .catch(error => {
          db.end();
          reject(error);
        });
    });
  }

  addOrUpdateItemsByIds(ids: number[], db: DatabaseUtil): Promise<UpdateProgressModel> {
    return new Promise<UpdateProgressModel>(async (resolve) => {
      const progress = new UpdateProgressModel('items', ids.length);
      /*const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 1,
        promiseImplementation: Promise
      });*/
      const startTime = +new Date();
      /*const promises: Promise<any>[] = [];*/
      for (const id of ids) {
        if (!isOffline && DateUtil.timeSince(startTime, 's') > 55) {
          continue;
        }

        try {
          await this.addItem(id, 'en_GB', db)
            .then(() => {
              progress.addSuccessful();
              console.log(`Completed ${progress.completed} / ${ids.length} (${
                Math.round(progress.completed / ids.length * 100)}%)`);
            })
            .catch(async error => {
              await db.query(`insert into missing_items(id, classic) values(${id}, 1)`).catch(console.error);
              console.error(error);
            })
            .finally(() => progress.addCompleted());
        } catch (e) {
          console.error(e);
        }
      }

      // await Promise.all(promises).catch(console.error);
      console.log(`Done processing ${progress.total} items (${progress.successful} successfully so).`);

      if (progress.successful) {
        console.log('Starting to update the static files');

        await (this.isClassic ? UpdatesService.getAndSetClassicItems() : UpdatesService.getAndSetItems())
          .then(() => console.log('Done uploading items'))
          .catch(console.error);
        await UpdatesService.getAndSetTimestamps()
          .then(() => console.log('Done updating the timestamps'))
          .catch(console.error);
        console.log('Done updating static files');
      }
      resolve(progress);
    });
  }

  /* istanbul ignore next */
  update(id: number, locale: string, conn: DatabaseUtil) {
    return new Promise<Item>((resolve, reject) => {
      this.getFreshItem(id, locale)
        .then(async item => {
          await QueryIntegrity.getVerified(this.table, item, conn)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }
              const sql = new RDSQueryUtil(this.table).update(item.id, friendlyItem);
              delete friendlyItem.itemSpells;
              conn.query(sql)
                .then(() => {
                  resolve(item);
                })
                .catch(error => {
                  reject(error);
                });
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  /* istanbul ignore next */
  getAllRelevant(timestamp: Date, locale: string, conn: DatabaseUtil) {
    return new Promise((resolve, reject) => {
      const sql = ItemQuery.getAllItemsAfterAndOrderByTimestamp(locale, timestamp);
      console.log('Item fetch', sql);
      conn.query(sql)
        .then((rows: any[]) => {
          const ts = rows[0] ? rows[0].timestamp : new Date().toJSON();
          resolve({
            timestamp: ts,
            items: ItemUtil.handleItems(rows)
          });
        })
        .catch((error) => {
          console.error('getAllRelevant failed for', {timestamp, locale}, 'with error', error);
          reject(error);
        });
    });
  }

  /* istanbul ignore next */
  async addItem(id: number, locale: string, db: DatabaseUtil = new DatabaseUtil(false)): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await this.getFreshItem(id, locale)
        .then(async item => {
          if (!item.isDropped) {
            item.isDropped = false;
          }

          await QueryIntegrity.getVerified(this.table, item, db)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }

              const query = new RDSQueryUtil(this.table)
                .insertOrUpdate(friendlyItem);
              console.log('Insert item SQL:', query);
              db.query(query)
                .then(async () => {
                  console.log(`Successfully added ${friendlyItem.name} (${id})`);
                  await LocaleUtil.insertToDB(
                    this.localeTable,
                    'id',
                    item.nameLocales,
                    db)
                    .then(() =>
                      console.log(`Successfully added locales for ${friendlyItem.name} (${id})`))
                    .catch(console.error);
                  const map = {};
                  try {
                    (item.itemSource?.droppedBy || [])
                      .forEach((drop) => map[drop.id] = drop.id);
                    (item.itemSource?.soldBy || [])
                      .forEach((vendor) => map[vendor.id] = vendor.id);
                  } catch (e) {
                    console.error(e);
                  }
                  try {
                    /*
                    await NpcHandler.addNPCIfMissing(
                      Object.keys(map).map(npcId => +npcId), db);
                    */
                  } catch (e) {
                    console.error('addItem failed at adding missing NPCs', e);
                  }
                  resolve(item);
                })
                .catch((error) => {
                  console.error(`Could not add item to DB! ${id} - ${friendlyItem.name}`, error);
                  reject(error);
                });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getFreshItem(id: number, locale: string, namespace: NameSpace = this.nameSpace): Promise<Item> {
    return new Promise<Item>((resolve, reject) => {
      const isClassic = namespace === NameSpace.STATIC_CLASSIC;

      console.log('Adding missing item', id);

      ItemUtil.getFromBlizzard(id, locale, undefined, namespace)
        .then(async (it: Item) => {
          let item: Item = new Item();
          item = it;

          if (!isClassic) {
            await ItemUtil.getWowDBData(id)
              .then(i =>
                WoWDBItem.setItemWithWoWDBValues(i, item))
              .catch(console.error);
          }

          await WoWHeadUtil.getWowHeadData(id, isClassic)
            .then((wowHead: WoWHead) => {
              item.setDataFromWoWHead(wowHead);
            })
            .catch(console.error);

          if (item.id > 175264 && (item.expansionId < 8 || !item.expansionId)) {
            item.expansionId = 8;
          }
          resolve(item);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}