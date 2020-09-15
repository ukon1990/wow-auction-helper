import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from './endpoints';
import {SharedService} from './shared.service';
import {Realm} from '../models/realm';
import {AuctionsService} from './auctions.service';
import {ErrorReport} from '../utils/error-report.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArrayUtil, DateUtil} from '@ukon1990/js-utilities';
import {BehaviorSubject, interval, Observable} from 'rxjs';
import {AuctionHouseStatus} from '../modules/auction/models/auction-house-status.model';
import {Report} from '../utils/report.util';
import {AuctionUpdateLog} from '../../../../api/src/models/auction/auction-update-log.model';
import {RealmStatus} from '../models/realm-status.model';
import {UserUtil} from '../utils/user/user.util';
import {environment} from '../../environments/environment';

@Injectable()
export class RealmService {
  private statusInterval: Observable<number> = environment.test ? null : interval(1000);
  private isCheckingStatus: boolean;
  previousUrl;
  events = {
    timeSince: new BehaviorSubject(0),
    realmStatus: new BehaviorSubject<AuctionHouseStatus>(undefined),
    list: new BehaviorSubject([]),
    map: new BehaviorSubject(new Map<number, RealmStatus>()),
    realmChanged: new EventEmitter<AuctionHouseStatus>()
  };

  constructor(private http: HttpClient,
              private matSnackBar: MatSnackBar) {
    if (!environment.test) {
      this.statusInterval.subscribe(() => this.checkForUpdates());
    }
  }

  public static gatherRealms(): void {
    const tmpMap: Map<string, Realm> = new Map<string, Realm>();
    SharedService.userRealms = new Array<Realm>();

    if (SharedService.user && SharedService.user.characters) {
      SharedService.user.characters.forEach(character => {
        if (!tmpMap[character.realm]) {
          const realm = SharedService.realms[UserUtil.slugifyString(character.realm)];
          tmpMap[character.realm] = realm;
        }
      });
    }

    Object.keys(tmpMap).forEach(key =>
      SharedService.userRealms.push(tmpMap[key]));
  }

  async changeRealm(auctionsService: AuctionsService, realm: string, region?: string) {
    if (region) {
      SharedService.user.region = region;
    }
    SharedService.user.realm = realm;
    UserUtil.save();
    return new Promise<AuctionHouseStatus>((resolve, reject) => {
      this.getStatus(
        SharedService.user.region,
        realm,
        true)
        .then(status => {
          this.events.realmChanged.emit(status);
          resolve(status);
        })
        .catch(error => {
          ErrorReport.sendError('RealmService.changeRealm', error);
          reject(error);
        });
    });
  }

  getLogForRealmWithId(ahId: number): Promise<AuctionUpdateLog> {
    return this.http.get(
      Endpoints.getLambdaUrl(`auction/log/${ahId}`)).toPromise() as Promise<AuctionUpdateLog>;
  }

  getStatus(region: string, realm: string, isInitialLoad = false): Promise<AuctionHouseStatus> {
    this.isCheckingStatus = false;
    const realmStatus = this.events.realmStatus.value,
      timeSince = realmStatus ? DateUtil.getDifferenceInSeconds(
        realmStatus.lowestDelay * 1000 * 60 + realmStatus.lastModified, new Date()) : false,
      versionId = timeSince && timeSince > 1 ? '?timeDiff=' + timeSince : '';
    return new Promise<AuctionHouseStatus>(((resolve, reject) => {
      this.http.get(Endpoints.getS3URL(region, 'auctions', realm) + versionId)
        .toPromise()
        .then(async (status: AuctionHouseStatus) => {
          this.previousUrl = status.url;
          this.events.realmStatus.next({
            ...status,
            connectedTo: status.connectedTo && typeof status.connectedTo === 'string' ?
              ('' + status['connectedTo']).split(',') : status.connectedTo,
            isInitialLoad,
          });

          if ((!this.events.map.value.get(status.id) || !this.events.map.value.get(status.id)['autoUpdate']) && !status.autoUpdate) {
            this.activateInactiveRealm(region, realm)
              .catch(error => ErrorReport.sendHttpError(error));
          }

          if (status.isUpdating && status.url !== this.previousUrl) {
            this.matSnackBar.open('New auction data is being processed on the server and will be available soon.');
            Report.debug('The server is processing new auction data', status);
          }
          this.isCheckingStatus = false;
          resolve(status);
        })
        .catch(error => {
          ErrorReport.sendHttpError(error, {useSnackBar: true});
          this.isCheckingStatus = false;
          reject(error);
        });
    }));
  }

  private activateInactiveRealm(region, realm): Promise<any> {
    this.openSnackbar('Your realm is currently inactive, it will now be activated');
    return this.http.get(Endpoints.getLambdaUrl(`realm/${region}/${realm}`, region))
      .toPromise()
      .then((status: AuctionHouseStatus) => {
        if (status.autoUpdate) {
          this.openSnackbar('Your realm is currently inactive, it will now be activated');
        }
      })
      .catch(error => {
        this.openSnackbar('Something went wrong, with activating your realm');
        ErrorReport.sendHttpError(error);
      });
  }

  getRealms(region?: string): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.http.get(Endpoints.getS3URL(region, 'auctions', 'status')) // Endpoints.getLambdaUrl('realm/all', region)
        .toPromise()
        .then((realms: any[]) => {
          this.handleRealms(realms);
          resolve(realms);
        })
        .catch(error => {
          ErrorReport.sendHttpError(error);
          reject(error);
        });
    }));
  }

  private openSnackbar(message: string): void {
    this.matSnackBar.open(message, 'Ok', {duration: 3000});
  }

  public handleRealms(realms: any[]) {
    if (ArrayUtil.isArray(realms)) {
      Object.keys(SharedService.realms).forEach(key => {
        delete SharedService.realms[key];
      });
      realms.forEach((realm: RealmStatus) => {
        this.events.map.value.set(realm.ahId, realm);
        SharedService.realms[realm.slug] = realm;
      });
      RealmService.gatherRealms();
      SharedService.events.realms.emit(true);
      this.events.list.next(realms);
    } else {
      ErrorReport.sendError('RealmService.handleRealms', {
        name: 'The app could not fetch the realm data correctly', message: 'No object were found', stack: undefined
      });
    }
  }

  private async checkForUpdates() {
    const {region, realm} = SharedService.user;
    if (!this.isCheckingStatus && this.shouldUpdateRealmStatus() && realm && region) {
      await this.getStatus(region, realm);
    }
  }

  private shouldUpdateRealmStatus(): boolean {
    const status = this.events.realmStatus.value;
    if (!status) {
      return true;
    }

    this.events.timeSince.next(DateUtil.timeSince(status.lastModified, 'm'));

    if (status.url !== this.previousUrl) {
      return true;
    }
    return !status || this.events.timeSince.value > status.lowestDelay;
  }
}
