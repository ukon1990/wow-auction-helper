import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Endpoints } from './endpoints';
import { SharedService } from './shared.service';
import { Realm } from '../models/realm';
import { AuctionsService } from './auctions.service';
import { User } from '../models/user/user';
import { ErrorReport } from '../utils/error-report.util';
import { Angulartics2 } from 'angulartics2';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class RealmService {

  constructor(private _http: HttpClient,
    private angulartics2: Angulartics2,
    private matSnackBar: MatSnackBar) {}

  public static async changeRealm(auctionService: AuctionsService, realm: string, region?: string) {
    if (region) {
      SharedService.user.region = region;
    }
    SharedService.user.realm = realm;
    User.save();

    if (SharedService.user.apiToUse === 'tsm') {
      await auctionService.getTsmAuctions();
    } else if (SharedService.user.apiToUse === 'wowuction') {
      await auctionService.getWoWUctionAuctions();
    }
    await auctionService.getLastModifiedTime(true);
  }

  getRealms(region?: string, isRetry?: boolean): Promise<any> {
    const url = isRetry ?
      `/assets/data/${Endpoints.getRegion(region)}-realms.json` : Endpoints.getBattleNetApi('realm/status?', region);
    return this._http.get(url)
      .toPromise()
      .then(r => {
        Object.keys(SharedService.realms).forEach(key => {
          delete SharedService.realms[key];
        });
        r['realms'].forEach( (realm: Realm) => {
          SharedService.realms[realm.slug] = realm;
        });
        Realm.gatherRealms();

      })
      .catch((error: HttpErrorResponse) => {
        const msg = 'Could not download realms';
        console.error(msg, error);
        ErrorReport.sendHttpError(error, this.angulartics2);
        this.openSnackbar(`${ msg }. Blizzard's API responded with: ${ error.status } - ${ error.statusText }`);

        // In case Blizzard's API fails, use old data json
        if (!isRetry) {
          this.getRealms(region, true);
        }
      });
  }

  private openSnackbar(message: string): void {
    this.matSnackBar.open(message, 'Ok', { duration: 3000 });
  }
}
