import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from './endpoints';
import { SharedService } from './shared.service';
import { Realm } from '../models/realm';
import { AuctionsService } from './auctions.service';
import { User } from '../models/user/user';

@Injectable()
export class RealmService {

  constructor(private _http: HttpClient) {}

  public static async changeRealm(auctionService: AuctionsService, realm: string, region?: string) {
    if (region) {
      SharedService.user.region = region;
    }
    SharedService.user.realm = realm;
    User.save();

    if (SharedService.user.apiToUse !== 'none') {
      await auctionService.getTsmAuctions();
    }
    await auctionService.getLastModifiedTime(true);
  }

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
