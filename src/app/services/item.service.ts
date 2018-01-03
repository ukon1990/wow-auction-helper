import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item/item';
import { Endpoints } from './endpoints';

@Injectable()
export class ItemService {
  constructor(private _http: HttpClient) { }

  addItem(itemID: number): void {
    console.log('Attempting to add item data for ' + itemID);
    this._http.get(`${Endpoints.WAH_API}GetItems.php?itemid=${itemID}`)
      .toPromise()
      .then((item) => {
        console.log('downloaded item', item);
        SharedService.items[(item as Item)[0].id] = (item as Item)[0];
        if (SharedService.auctionItemsMap[(item as Item)[0].id]) {
          SharedService.auctionItemsMap[(item as Item)[0].id].name = (item as Item)[0].name;
        }
      }).catch(e =>
        console.error('Could not get item with ID ' + itemID, e));
  }

  getItems(): Promise<any> {
    console.log('Downloading items');
    SharedService.downloading.items = true;
    return this._http.get(`${Endpoints.WAH_API}GetItems.php`)
      .toPromise()
      .then(items => {
        SharedService.itemsUnmapped = items['items'];
        localStorage['timestamp_items'] = new Date().toDateString();
        SharedService.downloading.items = false;
        items['items'].forEach(i => {
          SharedService.items[i.id] = i;
        });
        console.log('Items download is completed');
      })
      .catch(e => {
        SharedService.downloading.items = false;
        console.error('Items download failed', e);
      });
  }
}
