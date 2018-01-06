import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from './endpoints';
import { SharedService } from './shared.service';
import { Realm } from '../models/realm';

@Injectable()
export class RealmService {

  constructor(private _http: HttpClient) {}

  getRealms(region?: string): Promise<any> {
    return this._http.get(Endpoints.getBattleNetApi('realm/status?', region))
      .toPromise()
      .then(r => {
        Object.keys(SharedService.realms).forEach(key => {
          delete SharedService.realms[key];
        });
        r['realms'].forEach( (realm: Realm) => {
          SharedService.realms[realm.slug] = realm;
        });

      })
      .catch(e => console.error('Could not download realms', e));
  }
}
