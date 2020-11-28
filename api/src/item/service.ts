import {RDSItemRepository} from './repository';
import {DatabaseUtil} from '../utils/database.util';
import {BLIZZARD} from '../secrets';
import PromiseThrottle from 'promise-throttle';
import {ItemHandler} from '../handlers/item.handler';
import {Item} from '../../../client/src/client/models/item/item';
import {ItemQuery} from '../queries/item.query';
import {ItemUtil} from '../utils/item.util';
import {QueryIntegrity} from '../queries/integrity.query';
import {RDSQueryUtil} from '../utils/query.util';
import {LocaleUtil} from '../utils/locale.util';
import {WoWDBItem} from '../models/item/wowdb';
import {WoWHeadUtil} from '../utils/wowhead.util';
import {WoWHead} from '../models/item/wowhead';
import {UpdatesService} from '../updates/service';
import {DateUtil} from '@ukon1990/js-utilities';

export class ItemServiceV2 {
  private readonly repository = new RDSItemRepository();

  findMissingItemsAndImport(clientId?: string, clientSecret?: string): Promise<void> {
    if (clientId) {
      BLIZZARD.CLIENT_ID = clientId;
    }
    if (clientSecret) {
      BLIZZARD.CLIENT_SECRET = clientSecret;
    }

    return new Promise<void>((resolve, reject) => {
      const db = new DatabaseUtil(false);
      this.repository.findMissingItemsFromAuctions(db)
        .then(ids => {
          console.log(`There are ${ids.length} new items to add.`);
          this.addOrUpdateItemsByIds(ids, db)
            .then(() => {
              db.end();
              resolve();
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

  addOrUpdateItemsByIds(ids: number[], db: DatabaseUtil) {
    return new Promise<void>((resolve, reject) => {
      let completed = 0;
      let successfull = 0;
      const promiseThrottle = new PromiseThrottle({
        requestsPerSecond: 25,
        promiseImplementation: Promise
      });
      const startTime = +new Date();
      const promises: Promise<any>[] = [];
      ids.forEach(id => promises.push(
        promiseThrottle.add(() =>
        new Promise((success, fail) => {
          if (DateUtil.timeSince(startTime, 's') > 200) {
            success();
            return;
          }
          new ItemHandler()
            .addItem(id, 'en_GB', db)
            .then(() => {
              completed++;
              successfull++;
              console.log(`Completed ${completed} / ${ids.length} (${
                Math.round(completed / ids.length * 100)}%)`);
              success();
            })
            .catch(error => {
                completed++;
                console.error(error);
                fail(error);
              }
            );
        }))));
      Promise.all(promises)
        .then(async () => {
          console.log(`Done processing ${ids.length} items (${successfull} successfully so).`);
          if (successfull) {
            console.log('Starting to update the static files');
            await UpdatesService.getAndSetItems()
              .then(() => console.log('Done uploading items'))
              .catch(console.error);
            await UpdatesService.getAndSetTimestamps()
              .then(() => console.log('Done updating the timestamps'))
              .catch(console.error);
            console.log('Done updating static files');
          }
          resolve();
        })
        .catch(err => {
          console.error('Could not add items', err);
          reject(err);
        });
    });
  }

  /* istanbul ignore next */
  async getById(id: number, locale: string, conn: DatabaseUtil): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      conn.query(ItemQuery.getById(
        id, locale))
        .then(async (items: Item[]) => {
          if (items[0]) {
            resolve(ItemUtil.handleItem(items[0]));
            return;
          }

          const item: Item = await this.addItem(id, locale);
          if (item) {
            resolve(item);
          } else {
            reject();
          }
        })
        .catch(reject);
    });
  }

  /* istanbul ignore next */
  update(id: number, locale: string, conn: DatabaseUtil) {
    return new Promise<Item>((resolve, reject) => {
      this.getFreshItem(id, locale)
        .then(async item => {
          await QueryIntegrity.getVerified('items', item, conn)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }
              const sql = new RDSQueryUtil('items').update(item.id, friendlyItem);
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
      const sql = ItemQuery.getAllAuctionsAfterAndOrderByTimestamp(locale, timestamp);
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

          await QueryIntegrity.getVerified('items', item, db)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }

              const query = new RDSQueryUtil('items')
                .insertOrUpdate(friendlyItem);
              console.log('Insert item SQL:', query);
              db.query(query)
                .then(async itemSuccess => {
                  console.log(`Successfully added ${friendlyItem.name} (${id})`);
                  await LocaleUtil.insertToDB(
                    'item_name_locale',
                    'id',
                    item.nameLocales,
                    db)
                    .then(localeSuccess =>
                      console.log(`Successfully added locales for ${friendlyItem.name} (${id})`))
                    .catch(console.error);
                  const map = {};
                  item.itemSource.droppedBy
                    .forEach((drop) => map[drop.id] = drop.id);
                  item.itemSource.soldBy
                    .forEach((vendor) => map[vendor.id] = vendor.id);
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
                  reject(error);
                  console.error(`Could not add item to DB! ${id} - ${friendlyItem.name}`, error);
                });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getFreshItem(id: number, locale: string): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      let item: Item = new Item();
      let error;

      console.log('Adding missing item', id);

      await ItemUtil.getFromBlizzard(id, locale)
        .then((i: Item) =>
          item = i)
        .catch(e => error = e);

      if (!error) {
        await ItemUtil.getWowDBData(id)
          .then(i =>
            WoWDBItem.setItemWithWoWDBValues(i, item))
          .catch(e => error = e);
      }

      if (!error) {
        await WoWHeadUtil.getWowHeadData(id)
          .then((wowHead: WoWHead) => {
            item.setDataFromWoWHead(wowHead);
          })
          .catch(e => error = e);
      }

      if (error) {
        reject(error);
        return;
      }
      resolve(item);
    });
  }
}
