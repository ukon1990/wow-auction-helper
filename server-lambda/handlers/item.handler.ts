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

const request = require('request');

export class ItemHandler {
  async getById(event: APIGatewayEvent, callback: Callback) {
    // await AuthHandler.getToken();
    new DatabaseUtil()
      .query(ItemQuery.getById(
        +event.pathParameters.id,
        JSON.parse(event.body).locale))
      .then((items: Item[]) => {
        if (items[0]) {
          Response.send(
            ItemUtil.handleItem(items[0]), callback);
          return;
        }

        this.addItem(event, callback);
      })
      .catch(error =>
        Response.error(callback, error));
  }

  update(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;

    this.getFreshItem(id, event)
      .then(async item => {
        new DatabaseUtil()
          .query(ItemQuery.update(item))
          .then(() =>
            Response.send(item, callback))
          .catch(error =>
            Response.error(callback, error));
      })
      .catch(error =>
        Response.error(callback, error));
  }

  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body),
      timestamp = body.timestamp,
      locale = body.locale;

    new DatabaseUtil()
      .query(
        ItemQuery.getAllAuctionsAfterAndOrderByTimestamp(locale, timestamp))
      .then((items: Item[]) =>
        Response.send(ItemUtil.handleItems(items), callback))
      .catch(error =>
        Response.error(callback, error));
  }

  async addItem(event: APIGatewayEvent, callback?: Callback) {
    const id = +event.pathParameters.id;
    await this.getFreshItem(id, event)
      .then(item => {
        if (callback) {
          Response.send(item, callback);
        }

        new DatabaseUtil()
          .query(
            ItemQuery.insert(item));

        LocaleUtil.setLocales(
          id,
          'id',
          'item_name_locale',
          'item');
      })
      .catch(error => {
        console.error(error);
        Response.send(new Item(), callback);
      });
  }

  private getFreshItem(id, event: APIGatewayEvent) {
    return new Promise<Item>(async (resolve, reject) => {
      let item: Item = new Item();

      console.log('Adding missing item', id);

      await this.getFromBlizzard(id, event.pathParameters.locale)
        .then((i: Item) =>
          item = i)
        .catch(error =>
          console.error(error));

      await this.getWowDBData(id)
        .then(i =>
          WoWDBItem.setItemWithWoWDBValues(i, item))
        .catch(error =>
          console.error(error));

      await this.getWowheadData(id)
        .then(wowhead => {
          item.expansionId = wowhead.expansionId;
          delete wowhead.expansionId;
          item.itemSource = wowhead;
        })
        .catch(error =>
          console.error(error));

      if (item) {
        resolve(item);
      } else {
        reject();
      }
    });
  }

  getWowheadData(id: number): Promise<WoWHead> {
    return new Promise<WoWHead>(((resolve, reject) => {
      request.get(
        `http://www.wowhead.com/item=${id}`,
        (whError, whResponse, whBody) => {
          if (whError) {
            reject();
          }

          resolve(
            WoWHeadUtil.setValuesAll(whBody));
        });
    }));
  }

  getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise<WoWDBItem>(((resolve, reject) => {
      request.get(`http://wowdb.com/api/item/${id}`, (error, response, body) => {
        if (error || !body) {
          reject();
        } else {
          const object = body.slice(1, body.length - 1);
          resolve(
            JSON.parse(object) as WoWDBItem);
        }
      });
    }));
  }

  getFromBlizzard(id: number, locale: string): Promise<Item> {
    return new Promise<Item>(async (resolve, reject) => {
      await AuthHandler.getToken();

      request.get(
        new Endpoints()
          .getPath(`item/${id}?locale=${getLocale(locale)}`),
        (error, re, body) => {
          // const icon = JSON.parse(body).icon;
          if (error || !body) {
            reject();
          }
          resolve(JSON.parse(body) as Item);
        });
    });
  }
}
