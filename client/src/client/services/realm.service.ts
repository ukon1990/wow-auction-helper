import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from './endpoints';
import {SharedService} from './shared.service';
import {Realm} from '@shared/models';
import {ErrorReport} from '../utils/error-report.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ArrayUtil, DateUtil} from '@ukon1990/js-utilities';
import {BehaviorSubject, interval, Observable} from 'rxjs';
import {AuctionHouseStatus} from '../modules/auction/models/auction-house-status.model';
import {RealmStatus} from '@shared/models';
import {UserUtil} from '../utils/user/user.util';
import {environment} from '../../environments/environment';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {SettingsService} from '../modules/user/services/settings/settings.service';
import {CraftingService} from './crafting.service';
import {ItemService} from './item.service';
import {AuctionUpdateLog} from "@shared/models";

@Injectable()
export class RealmService {
  private statusInterval: Observable<number> = environment.test ? null : interval(25 * 1000);
  isCheckingStatus: boolean;
  private timeSinceInterval: Observable<number> = environment.test ? null : interval(1000);
  sm = new SubscriptionManager();
  previousUrl;
  isClassic = false;
  events = {
    timeSince: new BehaviorSubject(0),
    realmStatus: new BehaviorSubject<AuctionHouseStatus>(undefined),
    list: new BehaviorSubject<AuctionHouseStatus[]>([]),
    map: new BehaviorSubject<Map<number, RealmStatus>>(new Map<number, RealmStatus>()),
    realmChanged: new EventEmitter<AuctionHouseStatus>()
  };

  constructor(private http: HttpClient,
              private settingSync: SettingsService,
              private craftingService: CraftingService,
              private itemService: ItemService,
              private matSnackBar: MatSnackBar) {
    if (!environment.test) {
      this.sm.add(settingSync.realmChange, (change) => {
        if (change) {
          const {region, realm} = change;
          this.changeRealm(realm, region)
            .catch(console.error);
        }
      });
      this.statusInterval.subscribe(() => this.checkForUpdates());
      this.timeSinceInterval.subscribe(() => this.setTimeSince());
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

  async changeRealm(
    slug: string,
    region: string = SharedService.user.region,
    ahTypeId: number = SharedService.user.ahTypeId
  ) {
    return new Promise<AuctionHouseStatus>(async (resolve, reject) => {
      try {

        const ahTypeChanged = SharedService.user.ahTypeId !== ahTypeId;
        const ahId = this.getAhIdForSlug(region, slug);
        SharedService.user.region = region;
        SharedService.user.realm = slug;
        SharedService.user.ahTypeId = ahTypeId;
        SharedService.user.ahId = ahId;

        UserUtil.save();

        this.getStatus(
          SharedService.user.region,
          SharedService.user.realm,
          ahId,
          true,
          ahTypeChanged
        )
          .then(status => {
            this.events.realmChanged.emit(status);
            resolve(status);
          })
          .catch(error => {
            ErrorReport.sendError('RealmService.changeRealm', error);
            reject(error);
          });
      } catch (error) {
        ErrorReport.sendError('RealmService.changeRealm', {...error, slug, region, ahTypeId});
        resolve(this.events.realmStatus.value);
      }
    });
  }

  private getAhIdForSlug(region: string, slug: string) {
    const ahId = this.events.list.value.filter(realm =>
      realm.slug === slug && realm.region === region)[0].id;
    console.log('Regi slu', region, slug, ahId);
    return ahId;
  }

  getLogForRealmWithId(ahId: number): Promise<AuctionUpdateLog> {
    return this.http.get(
      Endpoints.getLambdaUrl(`auction/log/${ahId}`)).toPromise() as Promise<AuctionUpdateLog>;
  }

  private updateLastRequestedForRealm(
    region: string,
    ahId: number,
    lastRequested: number
  ): Promise<any> {
    return this.http.post(Endpoints.getLambdaUrl('realms/update-last-requested', region), {
      id: ahId,
      lastRequested,
    }).toPromise();
  }

  getStatus(
    region: string = SharedService.user.region,
    realm: string = SharedService.user.realm,
    ahId?: number,
    isInitialLoad = false, ahTypeIdChanged = false): Promise<AuctionHouseStatus> {
    if (!region || !ahId) {
      region = SharedService.user.region;
      if (!SharedService.user.ahId && SharedService.user.realm) {
        SharedService.user.ahId = this.getAhIdForSlug(region, realm);
      }
      if (SharedService.user.ahId) {
        ahId = SharedService.user.ahId;
      }
    }
    this.isCheckingStatus = true;
    const realmStatus = this.events.realmStatus.value,
      timeSince = realmStatus ? DateUtil.getDifferenceInSeconds(
        realmStatus.lowestDelay * 1000 * 60 + realmStatus.lastModified, new Date()) : false,
      versionId = timeSince && timeSince > 1 ? '?timeDiff=' + timeSince : '';
    return new Promise<AuctionHouseStatus>(((resolve, reject) => {
      this.http.get(Endpoints.getS3URL(region, 'status', `${ahId}`) + versionId)
        .toPromise()
        .then(async (house: AuctionHouseStatus) => {
          const status = this.connectRealmForHouse(house, realm);
          console.log('Status', status);
          const isClassic = status.gameBuild > 0;
          const recipeLength = CraftingService.list.value.length;
          status.ahTypeIsChanged = ahTypeIdChanged;

          /* TODO: Activate if I decide to allow the client to do this
          if (!realmStatus || status.lastModified !== realmStatus.lastModified) {
            // So that we can keep track of which realms to keep up to date
            this.updateLastRequestedForRealm(status.region, status.ahId, status.lastRequested)
              .then(res => console.log('updateLastRequestedForRealm', res))
              .catch(console.error);
          }
          */

          if (this.isClassic !== undefined && isClassic !== this.isClassic && recipeLength) {
            await this.craftingService.load(undefined, isClassic)
              .catch(console.error);
            await this.itemService.loadItems(undefined, isClassic)
              .catch(console.error);
          }

          this.isClassic = isClassic;
          this.previousUrl = status.url;
          this.itemService.clearItemHistoryMap();
          this.events.realmStatus.next({
            ...status,
            connectedTo: status.connectedTo && typeof status.connectedTo === 'string' ?
              ('' + status['connectedTo']).split(',') : status.connectedTo,
            isInitialLoad,
          } as AuctionHouseStatus);

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

  getRealms(region?: string): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.http.get(Endpoints.getS3URL(region, 'status', 'all') +
        '?random=' + (Math.random() * 1000)) // Endpoints.getLambdaUrl('realm/all', region)
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
    const {region, ahId, realm} = SharedService.user;
    if (!this.isCheckingStatus && this.shouldUpdateRealmStatus() && ahId && region) {
      await this.getStatus(region, realm, ahId);
    }
  }

  private shouldUpdateRealmStatus(): boolean {
    const status = this.events.realmStatus.value;
    if (!status || status.url !== this.previousUrl) {
      return true;
    }
    return !status || this.events.timeSince.value > status.lowestDelay;
  }

  private setTimeSince() {
    const status = this.events.realmStatus.value;
    if (status) {
      this.events.timeSince.next(DateUtil.timeSince(status.lastModified, 'm'));
    } else {
      this.events.timeSince.next(0);
    }
  }

  private connectRealmForHouse(house: any, slug: string): AuctionHouseStatus {
      const realms: AuctionHouseStatus[] = [];
      house.realms.forEach(realm => {
      realms.push({
        id: house.id,
        ahId: house.id,
        region: house.region,
        slug: realm.slug,
        name: realm.name,
        connectedTo: house.realmSlugs.split(','),
        realms: house.realms,
        battlegroup: house.battlegroup,
        locale: realm.locale,
        timezone: realm.timezone,
        url: house.url,
        tsmUrl: house.tsm ? house.tsm.url : undefined,
        lastModified: house.lastModified,
        lastRequested: house.lastRequested,
        nextUpdate: house.nextUpdate,
        size: house.size,
        lowestDelay: house.lowestDelay,
        avgDelay: house.avgDelay,
        highestDelay: house.highestDelay,
        stats: house.stats,
        gameBuild: house.gameBuild,
        firstRequested: house.firstRequested,
      });
    });
    return realms.filter(h => h.slug === slug)[0];
  }
}