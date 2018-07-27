import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item/item';
import { Endpoints } from './endpoints';
import { GameBuild } from '../utils/game-build.util';
import { DatabaseService } from './database.service';

@Injectable()
export class ItemService {
  constructor(private _http: HttpClient, private dbService: DatabaseService) { }

  addItem(itemID: number): void {
    console.log('Attempting to add item data for ' + itemID);
    this._http.get(Endpoints.getUrl(`item/${itemID}?locale=${ localStorage['locale'] }`))
      .toPromise()
      .then((item) => {
        console.log('downloaded item', item);
        SharedService.items[(item as Item)[0].id] = (item as Item)[0];
        if (SharedService.auctionItemsMap[(item as Item)[0].id]) {
          SharedService.auctionItemsMap[(item as Item)[0].id].name = (item as Item)[0].name;
          SharedService.auctionItemsMap[(item as Item)[0].id].vendorSell = (item as Item)[0].sellPrice;
        }
      }).catch(e =>
        console.error('Could not get item with ID ' + itemID, e));
  }

  getItems(): Promise<any> {
    console.log('Downloading items');
    SharedService.downloading.items = true;
    return this._http.get(Endpoints.getUrl(`item?locale=${ localStorage['locale'] }`))
      .toPromise()
      .then(items => {
        SharedService.itemsUnmapped = items['items'];
        localStorage['timestamp_items'] = new Date().toDateString();
        SharedService.downloading.items = false;
        items['items'].forEach((i: Item) => {
          // Making sure that the tradevendor item names are updated in case of locale change
          if (SharedService.tradeVendorMap[i.id]) {
            SharedService.tradeVendorMap[i.id].name = i.name;
          }

          if (i.itemClass === 8) {
            i.itemClass = 0;
            i.itemSubClass = 6;
          }
          SharedService.items[i.id] = i;
        });

        this.dbService.addItems(items['items']);
        console.log('Items download is completed');
      })
      .catch(e => {
        SharedService.downloading.items = false;
        console.error('Items download failed', e);
      });
  }

  updateItem(itemID: number): Promise<any> {
    return this._http.patch(Endpoints.getUrl(`item/${itemID}`), {})
      .toPromise() as Promise<any>;
  }

  /**
   * Throtteled adding of missing items
   *
   * @param {Array<number>} itemsToAdd A list of item id's that needs to be added
   * @param {number} [i] the next index to add
   * @returns {void}
   * @memberof ItemService
   */
  addItems(itemsToAdd: Array<number>, i?: number): void {
    if (!i) {
      i = 0;
    }

    if (itemsToAdd.length === 0) {
      return;
    }

    setTimeout(() => {
      if (itemsToAdd[i]) {
        SharedService.items[i] = new Item();
        this.addItem(itemsToAdd[i]);
      }

      i++;
      if (i === itemsToAdd.length) {
        console.log(`Done adding ${ i } items`);
        return;
      } else {
        this.addItems(itemsToAdd, i);
      }
    }, 100);
  }
}
