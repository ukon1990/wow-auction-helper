import {Response} from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import {getLocale, LocaleUtil} from './locale.util';
import {Item} from '../models/item/item';
import {DATABASE_CREDENTIALS} from './secrets';
import {WoWHeadUtil} from './wowhead.util';
import {WoWHead} from '../models/item/wowhead';
import {WoWDBItem} from '../models/item/wowdb';
import {ItemLocale} from '../models/item/item-locale';
import {ItemQuery} from '../queries/item.query';
import {Endpoints} from '../endpoints';

const PromiseThrottle: any = require('promise-throttle');

export class ItemUtil {

  public static async getItem(
    id: number,
    dbError: Error,
    items: Item[],
    response: Response,
    req: any,
    db: mysql.Connection) {
    if (dbError) {
      db.end();
      response.send(new Item());
      return;
    }

    if (items.length > 0) {
      db.end();
      ItemUtil.handleItem(items[0]);
      response.send(items[0]);
      return;
    } else {
      ItemUtil.downloadAllItemData(id)
        .then(item => {
          response.send(item);
          db.query(ItemQuery.insert(item), (dbInsertError) => {
            db.end();
            if (dbInsertError) {
              console.error(`Could not add ${id}:`, dbInsertError);
            }
            ItemUtil.getItemLocale(id, request, response);
          });
        })
        .catch(error => {
          console.error('handleItemGetRequest', error);
          response.statusCode = 404;
          response.send(new Item());
        });
    }
  }

  public static async patchItem(
    id: number,
    response: Response,
    req: any) {
    const db = mysql.createConnection(DATABASE_CREDENTIALS);
    ItemUtil.downloadAllItemData(id)
      .then((item: Item) => {
        response.send(item);
        console.log('Query: ', ItemQuery.update(item));
        db.query(ItemQuery.update(item),
          (err) => {
            db.end();
            if (err) {
              console.error(`The update failed for item ${id}`, item, err);
            } else {
              console.log(`Successfully updated ${item}`);
            }
          });
      })
      .catch(error => {
        console.error('Failed at getting item for updating', error);
        response.statusCode = 404;
        response.send(new Item());
      });
  }

  public static getItems(
    error: Error,
    items: Item[],
    response: Response,
    db: mysql.Connection): void {
    let timestamp;
    if (!error) {
      if (items.length > 0) {
        timestamp = items[0] ? items[0]['timestamp'] : undefined;
      }
      items.forEach(item =>
        ItemUtil.handleItem(item));
    }

    db.end();
    response.send({
      timestamp: timestamp,
      items: items ? items : []
    });
  }

  public static async patchItems(
    rows: Item[],
    resp: Response,
    req: any) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 80,
      promiseImplementation: Promise
    });
    const items: Item[] = [], itemIDs: any[] = [];
    let updateCount = 0;

    rows.forEach((item: Item) => {
      itemIDs.push(
        promiseThrottle.add(() => {
          return new Promise((resolve, reject) => {
            updateCount++;
            console.log(`Updating Item: ${item.name} (${updateCount} / ${rows.length}) ${req.headers.host}`);
            request.patch(`http://${req.headers.host}/api/item/${item.id}`, (res, error, body) => {
              if (error) {
                // console.error('handleItemsPatchRequest', error);
                console.error(`ERROR for item ID ${item.id} - > ${req.headers.host}/api/item/${item.id}`);
                reject(error);
              } else {
                console.log(`Added item ID ${item.id} - > ${req.headers.host}/api/item/${item.id}`);
                items.push(body);
                resolve(body);
              }
            });
          });
        }));
    });
    await Promise.all(itemIDs)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));

    resp.send(items);
  }

  /**
   * To add stuff from BFA
   * @static
   * @param {Item[]} rows
   * @param {Response} res
   * @param {*} req
   * @memberof ItemUtil
   */
  public static async getItemsToAdd(
    rows: number[],
    resp: Response,
    req: any) {
    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 20,
      promiseImplementation: Promise
    });
    const items: Item[] = [], itemIDs: any[] = [], failedIds = [];
    let updateCount = 0;

    rows.forEach((id: number) => {
      itemIDs.push(
        promiseThrottle.add(() => {
          return new Promise(async (resolve, reject) => {
            updateCount++;
            console.log(`Getting Item: ${id} (${updateCount} / ${rows.length}) ${req.headers.host}`);
            await request.get(`http://${req.headers.host}/api/item/${id}`, (res, error, body) => {
              if (error) {
                // console.error('handleItemsPatchRequest', error);
                console.error(`ERROR for item ID ${id} - > ${req.headers.host}/api/item/${id}`, error);
                failedIds.push(id);
                reject(error);
              } else {
                console.log(`Added item ID ${id} - > ${req.headers.host}/api/item/${id}`);
                items.push(body);
                resolve(body);
              }
            });
          });
        }));
    });
    await Promise.all(itemIDs)
      .then(r => {
      })
      .catch(e => console.error('Gave up :(', e));

    resp.send({success: items, failed: failedIds});
  }

  public static handleItem(item: Item): void {
    delete item['timestamp'];
    if (item.itemSource) {
      item.itemSource = JSON.parse((item.itemSource as any).replace(/[\n]/g, ''));
    }
    // TODO: Fix some issues regarding this json in the DB - r.itemSpells
    if (item.itemSpells) {
      item.itemSpells = JSON.parse(item.itemSpells as any);
    }
  }

  public static async downloadAllItemData(id: number): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      let item: Item;

      ItemUtil.getItemFromBlizzard(id, request)
        .then(async i => {
          item = new Item(i);
          await ItemUtil.getWowDBData(id)
            .then((wowdbItem: WoWDBItem) =>
              WoWDBItem.setItemWithWoWDBValues(wowdbItem, item))
            .catch(error => {
              console.error('downloadAllItemData.getWowDBData', error);
            });

          await ItemUtil.getWowheadData(id, WoWHeadUtil.setValuesAll)
            .then((wh: WoWHead) => {
              item.expansionId = wh.expansionId;
              delete wh.expansionId;
              item.itemSource = wh;
            })
            .catch(error =>
              console.error('downloadAllItemData.getWowheadData', error));

          if (!item) {
            reject();
          } else {
            resolve(item);
          }
        })
        .catch(error => {
          reject();
        });
    });
  }

  public static getWowheadData(id: number, action: Function) {
    return new Promise((resolve, reject) => {
      request.get(
        `http://www.wowhead.com/item=${id}`,
        (whError, whResponse, whBody) => {
          if (whError) {
            reject();
          }

          resolve(
            action(whBody));
        });
    });
  }

  public static getWoWDB(req: any, res: Response): void {
    ItemUtil.getWowDBData(req.params.id)
      .then((item: WoWDBItem) => {
        res.send(item);
      })
      .catch(() =>
        res.send(new WoWDBItem()));
  }

  public static getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise((resolve, reject) => {
      request.get(`http://wowdb.com/api/item/${id}`, (error, response, body) => {
        if (error || !body) {
          reject();
        } else {
          const object = body.slice(1, body.length - 1);
          resolve(
            JSON.parse(object) as WoWDBItem);
        }
      });
    });
  }

  public static getItemFromBlizzard(id: number, req: any): Promise<Item> {
    return new Promise((resolve, reject) => {
      request.get(
        new Endpoints()
          .getPath(`item/${id}?locale=${getLocale(req)}`),
        (error, re, body) => {
          // const icon = JSON.parse(body).icon;
          if (error || !body) {
            reject();
          }
          resolve(JSON.parse(body) as Item);
        });
    });
  }

  public static async setMissingLocales(req, res) {
    // Limit to 9 per second
    return new Promise((resolve, reject) => {
      const db = mysql.createConnection(DATABASE_CREDENTIALS);
      // select * from item_name_locale where en_GB = 'undefined';
      // select id from items where id not in (select id from item_name_locale);
      db.query(`
            select id
            from items
            where id not in (select id from item_name_locale);`,
        async (err, rows, fields) => {
          if (!err) {
            const promiseThrottle = new PromiseThrottle({
              requestsPerSecond: 1,
              promiseImplementation: Promise
            });

            const list = [];
            const itemIDs = [];
            rows.forEach(row => {
              itemIDs.push(
                promiseThrottle.add(() => {
                  return new Promise((rowResolve, rowReject) => {
                    this.getItemLocale(row.id, req, res)
                      .then(r => {
                        list.push(r);
                        rowResolve(r);
                      })
                      .catch(e => {
                        console.error('setMissingLocales failed', e);
                        rowReject({});
                      });
                  });
                }));
            });
            await Promise.all(itemIDs)
              .then(r => {
              })
              .catch(e => console.error('setMissingLocales failed', e));
            resolve(list);
          } else {
            reject({});
          }
        });
    });
  }

  public static async getItemLocale(id: number, req, res): Promise<ItemLocale> {
    return LocaleUtil.setLocales(
      id,
      'id',
      'item_name_locale',
      'item');
  }
}
