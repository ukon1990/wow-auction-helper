import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {ItemQuery} from '../queries/item.query';
import {Response} from '../utils/response.util';
import {WoWDBItem} from '../models/item/wowdb';
import {ItemUtil} from '../utils/item.util';
import {WoWHeadUtil} from '../utils/wowhead.util';
import {Endpoints} from '../utils/endpoints.util';
import {getLocale, LocaleUtil} from '../utils/locale.util';
import {AuthHandler} from './auth.handler';
import * as request from 'request';
import {HttpClientUtil} from '../utils/http-client.util';
import {WoWHead} from '../models/item/wowhead';
import {Item} from '../../../client/src/client/models/item/item';
import {QueryIntegrity} from '../queries/integrity.query';
import {QueryUtil} from '../utils/query.util';
import {NPCUtil} from '../utils/npc.util';
import {NpcHandler} from './npc.handler';
import {AuctionItemStat, AuctionProcessorUtil} from '../utils/auction-processor.util';

export class ItemHandler {
  /* istanbul ignore next */
  async getById(id: number, locale: string): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      new DatabaseUtil()
        .query(ItemQuery.getById(
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
  update(id: number, locale: string) {
    return new Promise<Item>((resolve, reject) => {
      this.getFreshItem(id, locale)
        .then(async item => {
          const conn = new DatabaseUtil(false);
          await QueryIntegrity.getVerified('items', item, conn)
            .then((friendlyItem) => {
              if (!friendlyItem) {
                console.log(`Failed to add item: ${id} did not match the model`);
                reject('The item did not follow the data model - ' + item.id);
                return;
              }
              const sql = new QueryUtil('items').update(item.id, friendlyItem);
              console.log('SQL: ', sql);
              delete friendlyItem.itemSpells;
              conn.query(sql)
                .then(() => {
                  conn.end();
                  resolve(item);
                })
                .catch(error => {
                  conn.end();
                  reject(error);
                });
            })
            .catch(error => {
              conn.end();
              reject(error);
            });
        })
        .catch(reject);
    });
  }

  /* istanbul ignore next */
  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body),
      timestamp = body.timestamp,
      locale = body.locale;

    new DatabaseUtil()
      .query(
        ItemQuery.getAllAuctionsAfterAndOrderByTimestamp(locale, timestamp))
      .then((rows: any[]) => {
        const ts = rows[0] ? rows[0].timestamp : new Date().toJSON(),
          items = ItemUtil.handleItems(rows);
        Response.send({
          timestamp: ts,
          items
        }, callback);
        items.length = 0;
        rows.length = 0;
      })
      .catch(error =>
        Response.error(callback, error, event));
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

              const query = new QueryUtil('items').insert(friendlyItem);
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

  /* istanbul ignore next */
  async getPriceHistoryFor(ahId: number, id: number, petSpeciesId: number = -1, bonusIds?: any[], onlyHourly = true): Promise<any> {
    console.log(`getPriceHistoryFor ahId=${ahId} item=${id} pet=${petSpeciesId}`);
    const conn = new DatabaseUtil(false);
    if (onlyHourly) {
      return new Promise((resolve, reject) => {
        this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
          .then(r => {
            conn.end();
            resolve(r);
          })
          .catch(e => {
            console.error(e);
            conn.end();
            resolve([]);
          });
      });
    }
    const result = {
      hourly: [],
      daily: [],
    };
    return new Promise((resolve, reject) => {
      try {
        Promise.all([
          this.getPriceHistoryHourly(ahId, id, petSpeciesId, bonusIds, conn)
            .then(r => result.hourly = r)
            .catch(console.error),
          this.getPriceHistoryDaily(ahId, id, petSpeciesId, bonusIds, conn)
            .then(r => result.daily = r)
            .catch(console.error)
        ])
          .then(() => {
            conn.end();
            AuctionProcessorUtil.setCurrentDayFromHourly(result);
            resolve(result);
          })
          .catch(err => {
            console.error(err);
            conn.end();
            resolve(result);
          });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  private getPriceHistoryHourly(ahId: number, id: number, petSpeciesId: number, bonusIds: any[], conn: DatabaseUtil): Promise<any> {
    return new Promise((resolve, reject) => {
      const fourteenDays = 60 * 60 * 24 * 1000 * 14;
      conn.query(`SELECT *
                FROM itemPriceHistoryPerHour
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = ${AuctionItemStat.bonusId(bonusIds)}
                  AND UNIX_TIMESTAMP(date) > ${(+new Date() - fourteenDays) / 1000};`)
        .then((result => {
          resolve(AuctionProcessorUtil.processHourlyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }

  private getPriceHistoryDaily(ahId: number, id: number, petSpeciesId: number, bonusIds: any[], conn: DatabaseUtil): Promise<any[]> {
    return new Promise((resolve, reject) => {
      conn.query(`SELECT *
                FROM itemPriceHistoryPerDay
                WHERE ahId = ${ahId}
                  AND itemId = ${id}
                  AND petSpeciesId = ${petSpeciesId}
                  AND bonusIds = ${AuctionItemStat.bonusId(bonusIds)};`)
        .then((result => {
          resolve(AuctionProcessorUtil.processDailyPriceData(result));
        }))
        .catch((error) => {
          console.error(error);
          resolve([]);
        });
    });
  }
}
