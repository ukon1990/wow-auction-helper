import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {ItemQuery} from '../queries/item.query';
import {Item} from '../models/item/item';
import {Response} from '../utils/response.util';
import {WoWDBItem} from '../models/item/wowdb';
import {WoWHead} from '../models/item/wowhead';
import {ItemUtil} from '../utils/item.util';
import {WoWHeadUtil} from '../utils/wowhead.util';
import {Endpoints} from '../utils/endpoints.util';
import {getLocale, LocaleUtil} from '../utils/locale.util';
import {AuthHandler} from './auth.handler';
import * as request from 'request';

export class ItemHandler {
  async getById(id: number, locale: string): Promise<Item> {
    // await AuthHandler.getToken();
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

  update(id: number, locale: string) {
    return new Promise<Item>((resolve, reject) => {
      this.getFreshItem(id, locale)
        .then(async item => {
          console.log('SQL: ', ItemQuery.update(item)); // inventoryType
          new DatabaseUtil()
            .query(ItemQuery.update(item))
            .then(() =>
              resolve(item))
            .catch(reject);
        })
        .catch(reject);
    });
  }

  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body),
      timestamp = body.timestamp,
      locale = body.locale;

    new DatabaseUtil()
      .query(
        ItemQuery.getAllAuctionsAfterAndOrderByTimestamp(locale, timestamp))
      .then((rows: any[]) =>
        Response.send({
          timestamp: rows[0] ? rows[0].timestamp : new Date().toJSON(),
          items: ItemUtil.handleItems(rows)
        }, callback))
      .catch(error =>
        Response.error(callback, error, event));
  }

  async addItem(id: number, locale: string): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await this.getFreshItem(id, locale)
        .then(item => {/*
          if (callback) {
            Response.send(item, callback);
          }*/
          resolve(item);

          new DatabaseUtil()
            .query(
              ItemQuery.insert(item));

          LocaleUtil.setLocales(
            id,
            'id',
            'item_name_locale',
            'item');
        })
        .catch(reject);
    });
  }

  getFreshItem(id: number, locale: string) {
    return new Promise<Item>(async (resolve, reject) => {
      let item: Item = new Item();
      let error;

      console.log('Adding missing item', id);

      await this.getFromBlizzard(id, locale)
        .then((i: Item) =>
          item = i)
        .catch(e => error = e);

      if (!error) {
        await this.getWowDBData(id)
          .then(i =>
            WoWDBItem.setItemWithWoWDBValues(i, item))
          .catch(e => error = e);
      }

      if (!error) {
        await this.getWowheadData(id)
          .then(wowhead => {
            item.expansionId = wowhead.expansionId;
            delete wowhead.expansionId;
            item.itemSource = wowhead;
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

  getWowheadData(id: number): Promise<WoWHead> {
    return new Promise<WoWHead>(((resolve, reject) => {
      request.get(
        `http://www.wowhead.com/item=${id}`,
        null,
        (whError, whResponse, whBody) => {
          if (whError) {
            reject(`Could not find the item with id=${id} on WoWHead`);
          }

          resolve(
            WoWHeadUtil.setValuesAll(whBody));
        });
    }));
  }

  getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise<WoWDBItem>(((resolve, reject) => {
      request.get(`http://wowdb.com/api/item/${id}`,
        (error, response, body) => {
        const errorMessage = {error: `Could not get data from WoWDB for an item id=${id}`};
        if (error || !body) {
          reject(errorMessage);
        } else {
          try {
            const object = body.slice(1, body.length - 1);
            resolve(
              JSON.parse(object) as WoWDBItem);
          } catch (e) {
            reject(errorMessage);
          }
        }
      });
    }));
  }

  getFromBlizzard(id: number, locale: string = 'en_GB', region: string = 'eu'): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await AuthHandler.getToken();

      request.get(
        new Endpoints()
          .getPath(`item/${id}?locale=${getLocale(locale)}`, region),
        (error, re, body) => {
          const errorMessage = `Could not find item with id=${id} from Blizzard`;
          if (error || !body || re.statusCode === 404) {
            reject(errorMessage);
          }
          resolve(JSON.parse(body) as Item);
        });
    });
  }
}
