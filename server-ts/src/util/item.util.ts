import { Request, Response } from 'express';
import * as mysql from 'mysql';
import * as request from 'request';
import * as RequestPromise from 'request-promise';
import * as PromiseThrottle from 'promise-throttle';
import { getLocale } from '../util/locales';
import { safeifyString } from './string.util';
import { Item } from '../models/item/item';
import { BLIZZARD_API_KEY, DATABASE_CREDENTIALS } from './secrets';
import { WoWHeadUtil } from './wowhead.util';
import { WoWHead } from '../models/item/wowhead';
import { WoWDBItem } from '../models/item/wowdb';
import { ItemLocale } from '../models/item/item-locale';

export class ItemUtil {

  public static async handleItemRequest(
    id: number,
    error: Error,
    items: Item[],
    response: Response,
    request: any,
    db: mysql.Connection) {
    if (error) {
      db.end();
      response.send(new Item());
      return;
    }
    /*
        if (items.length > 0) {
          db.end();
          ItemUtil.handleItem(items[0]);
          response.send(items[0]);
          return;
        }*/
    let item: Item;

    /*await ItemUtil.getItemFromBlizzard(id, request)
      .then(i => item = new Item(i))
      .catch(error => console.error(error));
    await ItemUtil.getWowDBData(id)
      .then((i: WoWDBItem) =>
        WoWDBItem.setItemWithWoWDBValues(i, item))
      .catch(error => console.error(error));*/
    let re = '';
    await ItemUtil.getWowheadData(id, WoWHeadUtil.setValuesAll)
      .then((id: any) => re = id) // item.expansionId = id
      .catch(error => console.error(error));
    response.send(re);
  }
  public static handleItemsRequest(
    error: Error,
    items: Item[],
    response: Response,
    db: mysql.Connection): void {
    if (!error) {
      items.forEach(item =>
        ItemUtil.handleItem);
    }

    db.end();
    response.send({
      items: items ? items : []
    });
  }

  public static handleItem(item: Item): void {
    item.itemSource = item.itemSource as any === '[]' ?
      [] : JSON.parse((item.itemSource as any).replace(/[\n]/g, ''));
    // TODO: Fix some issues regarding this json in the DB - r.itemSpells
    item.itemSpells = item.itemSpells as any === '[]' ? [] : [];
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

  public static getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise((resolve, reject) => {
      request.get(`http://wowdb.com/api/item/${id}`, (error, response, body) => {
        if (error) {
          reject();
        }
        resolve(
          JSON.parse(body.slice(1, body.length - 1)) as WoWDBItem);
      });
    });
  }

  public static getItemFromBlizzard(id: number, req: any): Promise<Item> {
    return new Promise((resolve, reject) => {
      request.get(
        `https://eu.api.battle.net/wow/item/${id}?locale=${getLocale(req)}&apikey=${BLIZZARD_API_KEY}`,
        (error, re, body) => {
          // const icon = JSON.parse(body).icon;
          if (error) {
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
      db.query(`
        select id from items
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
                  return new Promise((resolve, reject) => {
                    this.getItemLocale(row.id, req, res)
                      .then(r => {
                        list.push(r);
                        resolve(r);
                      })
                      .catch(e => {
                        console.error(e);
                        reject({});
                      });
                  });
                }));
            });
            await Promise.all(itemIDs)
              .then(r => { })
              .catch(e => console.error(e));
            resolve(list);
          } else {
            reject({});
          }
        });
    });
  }

  public static async getItemLocale(itemID: number, req, res): Promise<ItemLocale> {
    return new Promise<ItemLocale>(async (resolve, reject) => {
      const item = new ItemLocale(itemID);

      const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
        .map(locale =>
          RequestPromise.get(
            `https://eu.api.battle.net/wow/item/${itemID}?locale=${locale}&apikey=${BLIZZARD_API_KEY}`,
            (r, e, b) =>
              ItemUtil.resolveLocaleResponse(item, locale, b))),
        usPromises = ['en_US', 'es_MX', 'pt_BR']
          .map(locale =>
            RequestPromise.get(`https://us.api.battle.net/wow/item/${itemID}?locale=${locale}&apikey=${BLIZZARD_API_KEY}`,
              (r, e, b) =>
                ItemUtil.resolveLocaleResponse(item, locale, b)));

      await Promise.all(euPromises).then(r => {
      }).catch(e => {
        // console.error(e);
      });

      await ItemUtil.doLocaleInsertQuery(item);
      return item;
    });
  }

  public static resolveLocaleResponse(item: ItemLocale, locale: string, b): void {
    try {
      item[locale] = JSON.parse(b).name;
    } catch (e) {
      item[locale] = '404';
    }
  }

  public static async doLocaleInsertQuery(item: ItemLocale): Promise<ItemLocale> {
    return new Promise<ItemLocale>((resolve, reject) => {
      try {
        const db = mysql.createConnection(DATABASE_CREDENTIALS),
          sql = `INSERT INTO item_name_locale
        (id, en_GB, en_US, de_DE, es_ES, es_MX, fr_FR, it_IT, pl_PL, pt_PT, pt_BR, ru_RU)
        VALUES
        (${item.id},
          "${safeifyString(item.en_GB)}",
          "${safeifyString(item.en_US)}",
          "${safeifyString(item.de_DE)}",
          "${safeifyString(item.es_ES)}",
          "${safeifyString(item.es_MX)}",
          "${safeifyString(item.fr_FR)}",
          "${safeifyString(item.it_IT)}",
          "${safeifyString(item.pl_PL)}",
          "${safeifyString(item.pt_PT)}",
          "${safeifyString(item.pt_BR)}",
          "${safeifyString(item.ru_RU)}");`;

        db.query(sql, (err, rows, fields) => {
          db.end();
          if (!err) {
            console.log(`Locale added to db for ${item.en_GB}`);
            reject();
          } else {
            console.error(`Locale not added to db for ${item.en_GB}`, err);
            resolve(item);
          }
        });
        //
      } catch (e) {
        reject();
      }
    });
  }
}
