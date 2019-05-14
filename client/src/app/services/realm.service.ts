import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Endpoints} from './endpoints';
import {SharedService} from './shared.service';
import {Realm} from '../models/realm';
import {AuctionsService} from './auctions.service';
import {User} from '../models/user/user';
import {ErrorReport} from '../utils/error-report.util';
import {Angulartics2} from 'angulartics2';
import {MatSnackBar} from '@angular/material';
import {ObjectUtil} from '../utils/object.util';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class RealmService {
  events = {
    realmStatus: new BehaviorSubject(undefined),
    list: new BehaviorSubject([])
  };

  constructor(private http: HttpClient,
              private angulartics2: Angulartics2,
              private matSnackBar: MatSnackBar) {
  }

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

  getStatus(region: string, realm: string): Promise<any> {
    return this.http.get(Endpoints.getLambdaUrl(`realm/${region}/${realm}`, region))
      .toPromise()
      .then(status => {
        this.events.realmStatus.next(status);
      })
      .catch(error => {
      });
  }

  getRealms(region?: string): Promise<any> {
    return this.http.get(Endpoints.getLambdaUrl('realm/all', region))
      .toPromise()
      .then((realms: any[]) =>
        this.handleRealms(realms))
      .catch();
  }

  private openSnackbar(message: string): void {
    this.matSnackBar.open(message, 'Ok', {duration: 3000});
  }

  public handleRealms(realms: any[]) {
    if (ObjectUtil.isArray(realms)) {
      Object.keys(SharedService.realms).forEach(key => {
        delete SharedService.realms[key];
      });
      realms.forEach((realm: Realm) => {
        SharedService.realms[realm.slug] = realm;
      });
      Realm.gatherRealms();
      SharedService.events.realms.emit(true);
      this.events.list.next(realms);
    } else {
      ErrorReport.sendError('RealmService.handleRealms', {
        name: 'The app could not fetch the realm data correctly', message: 'No object were found', stack: undefined
      });
    }
  }
}
