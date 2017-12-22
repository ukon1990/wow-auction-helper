import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item/item';

@Injectable()
export class ItemService {
  constructor(private _http: HttpClient) { }

  getItems(): Promise<any> {
    console.log('Downloading items');
    return this._http.get('assets/mock/items.json')
      .toPromise()
      .then(items => {
        items['items'].forEach(i => {
          SharedService.items[i.id] = i;
        });
        console.log('Items download is completed');
      })
      .catch(e => console.error('Items download failed', e));
  }
}
