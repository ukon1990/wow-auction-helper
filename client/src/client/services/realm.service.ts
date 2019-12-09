import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from './endpoints';
import {SharedService} from './shared.service';
import {Realm} from '../models/realm';
import {AuctionsService} from './auctions.service';
import {User} from '../models/user/user';
import {ErrorReport} from '../utils/error-report.util';
import {Angulartics2} from 'angulartics2';
import {MatSnackBar} from '@angular/material';
import {ArrayUtil} from '@ukon1990/js-utilities';
import {BehaviorSubject} from 'rxjs';
import {AuctionHouseStatus} from '../modules/auction/models/auction-house-status.model';
import {Report} from '../utils/report.util';
import {AuctionUpdateLog} from '../../../../api/src/models/auction/auction-update-log.model';

@Injectable()
export class RealmService {
  previousUrl;
  events = {
    realmStatus: new BehaviorSubject(undefined),
    list: new BehaviorSubject([])
  };

  constructor(private http: HttpClient,
              private angulartics2: Angulartics2,
              private matSnackBar: MatSnackBar) {
  }

  async changeRealm(auctionsService: AuctionsService, realm: string, region?: string, updateApi?: boolean) {
    if (region) {
      SharedService.user.region = region;
    }
    SharedService.user.realm = realm;
    User.save();

    if (updateApi) {
      if (SharedService.user.apiToUse === 'tsm') {
        await auctionsService.getTsmAuctions();
      } else if (SharedService.user.apiToUse === 'wowuction') {
        await auctionsService.getWoWUctionAuctions();
      }
    }
    await this.getStatus(
      SharedService.user.region,
      realm);
  }

  getLogForRealmWithId(ahId: number): Promise<AuctionUpdateLog> {
    return this.http.get(
      Endpoints.getLambdaUrl(`auction/log/${ahId}`)).toPromise() as Promise<AuctionUpdateLog>;
  }

  getStatus(region: string, realm: string): Promise<any> {
    return this.http.get(Endpoints.getLambdaUrl(`realm/${region}/${realm}`, region))
      .toPromise()
      .then((status: AuctionHouseStatus) => {
        this.events.realmStatus.next(status);

        if (status.isUpdating && status.url !== this.previousUrl) {
          this.matSnackBar.open('New auction data is being processed on the server and will be available soon.');
          this.previousUrl = status.url;
          Report.debug('The server is processing new auction data', status);
        }
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
    if (ArrayUtil.isArray(realms)) {
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
