import {APIGatewayEvent, Callback} from 'aws-lambda';
import {DatabaseUtil} from '../utils/database.util';
import {ItemQueries} from '../queries/item.queries';
import {Item} from '../models/item/item';
import {Response} from '../utils/response.util';
import {WoWDBItem} from '../models/item/wowdb';
import {WoWHead} from '../models/item/wowhead';
import {ItemUtil} from '../utils/item.util';

export class ItemHandler {
  async getById(event: APIGatewayEvent, callback: Callback) {
    console.log('getById', +event.pathParameters.id);
    // await AuthHandler.getToken();
    new DatabaseUtil()
      .query(ItemQueries.getById(
        +event.pathParameters.id,
        JSON.parse(event.body).locale))
      .then((items: Item[]) => {
        console.log('gotById', items);
        if (items[0]) {
          Response.get(
            ItemUtil.handleItem(items[0]), callback);
          return;
        }

        this.addItem(event, callback);
      })
      .catch(error =>
        Response.error(callback, error));
  }

  update(event: APIGatewayEvent, callback: Callback) {

  }

  getAllRelevant(event: APIGatewayEvent, callback: Callback) {
    const body = JSON.parse(event.body),
      timestamp = body.timestamp,
      locale = body.locale;

    new DatabaseUtil()
      .query(ItemQueries.getAllItemsOrderByTimestamp(locale))
      .then((items: Item[]) =>
        Response.get(ItemUtil.handleItems(items), callback))
      .catch(error =>
        Response.error(callback, error));
  }

  async addItem(event: APIGatewayEvent, callback: Callback) {
    const id = +event.pathParameters.id;
    let item: Item;
    console.log('Adding missing item', id);
    await this.getFromBlizzard(id).then((i: Item) =>
      item = i);

    await this.getWowDBData(id).then();
    await this.getWowheadData(id).then();
  }

  getWowheadData(id: number): Promise<WoWHead> {
    return new Promise<WoWHead>(((resolve, reject) => {
      resolve();
    }));
  }

  getWowDBData(id: number): Promise<WoWDBItem> {
    return new Promise<WoWDBItem>(((resolve, reject) => {
      resolve();
    }));
  }

  getFromBlizzard(id: number): Promise<Item> {
    return new Promise<Item>(((resolve, reject) => {
      resolve();
    }));
  }
}
