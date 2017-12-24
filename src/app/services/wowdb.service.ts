import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WoWDBItem } from '../models/item/wowdb';

@Injectable()
export class WowdbService {

  constructor(private _http: HttpClient) { }

  getItem(itemID): Promise<WoWDBItem> {
    return this._http.get(`http://www.wah.jonaskf.net/GetWowDB.php?itemID=${itemID}`)
      .toPromise();
  }
}
