import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WoWDBItem } from '../models/item/wowdb';
import { Endpoints } from './endpoints';

@Injectable()
export class WowdbService {

  constructor(private _http: HttpClient) { }

  getItem(itemID): Promise<WoWDBItem> {
    return this._http.get(Endpoints.getUrl(`item/wowdb/${ itemID }`))
      .toPromise();
  }
}
