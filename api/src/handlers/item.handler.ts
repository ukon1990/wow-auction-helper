import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {ItemQuery} from '../queries/item.query';
import {Response} from '../utils/response.util';
import {WoWDBItem} from '../models/item/wowdb';
import {ItemUtil} from '../utils/item.util';
import {WoWHeadUtil} from '../utils/wowhead.util';
import {LocaleUtil} from '../utils/locale.util';
import {WoWHead} from '../models/item/wowhead';
import {Item} from '../../../client/src/client/models/item/item';
import {QueryIntegrity} from '../queries/integrity.query';
import {RDSQueryUtil} from '../utils/query.util';
import {NpcHandler} from './npc.handler';
import {AuctionProcessorUtil} from '../auction/utils/auction-processor.util';
import {AuctionItemStat} from '../auction/models/auction-item-stat.model';

export class ItemHandler {
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
  async addItem(id: number, locale: string): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await this.getFreshItem(id, locale)
        .then(async item => {

          await QueryIntegrity.getVerified('items', item)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }

              const query = new RDSQueryUtil('items').insert(friendlyItem);
              console.log('Insert item SQL:', query);
              new DatabaseUtil()
                .query(query)
                .then(async itemSuccess => {
                  resolve(item);
                  console.log(`Successfully added ${friendlyItem.name} (${id})`);
                  await LocaleUtil.insertToDB(
                    'item_name_locale',
                    'id',
                    item.nameLocales)
                    .then(localeSuccess => console.log(`Successfully added locales for ${friendlyItem.name} (${id})`))
                    .catch(console.error);
                  const map = {};
                  item.itemSource.droppedBy
                    .forEach((drop) => map[drop.id] = drop.id);
                  item.itemSource.soldBy
                    .forEach((vendor) => map[vendor.id] = vendor.id);
                  try {
                    await NpcHandler.addNPCIfMissing(
                      Object.keys(map).map(npcId => +npcId));
                  } catch (e) {
                    console.error('addItem failed at adding missing NPCs', e);
                  }
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
