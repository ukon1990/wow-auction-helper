import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SharedService} from './shared.service';
import {AuctionUtil, OrganizedAuctionResult} from '../modules/auction/utils/auction.util';
import {DatabaseService} from './database.service';
import {ItemService} from './item.service';
import {Notifications} from '../models/user/notification';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorReport} from '../utils/error-report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {BehaviorSubject} from 'rxjs';
import {Auction} from '@shared/models';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {RealmService} from './realm.service';
import {AuctionHouseStatus} from '../modules/auction/models/auction-house-status.model';
import {TsmService} from '../modules/tsm/tsm.service';
import {CharacterService} from '../modules/character/services/character.service';
import {CraftingUtil} from '../modules/crafting/utils/crafting.util';
import {SettingsService} from '../modules/user/services/settings/settings.service';
import {UserSettings} from '../modules/user/models/settings.model';
import {ItemStats} from '@shared/models';
import {AuctionItemStat} from '@shared/models/auction/auction-item-stat.model';
import {Report} from "../utils/report.util";

@Injectable()
export class AuctionsService {
  list: BehaviorSubject<AuctionItem[]> = new BehaviorSubject<AuctionItem[]>([]);
  mapped: BehaviorSubject<Map<string, AuctionItem>> = new BehaviorSubject<Map<string, AuctionItem>>(new Map<string, AuctionItem>());
  mappedVariations: BehaviorSubject<Map<number, AuctionItem[]>> = new BehaviorSubject(new Map<number, AuctionItem[]>());
  auctions: BehaviorSubject<Auction[]> = new BehaviorSubject<Auction[]>([]);
  stats: BehaviorSubject<Map<string, ItemStats>> = new BehaviorSubject(new Map<string, ItemStats>());
  statsVariations: BehaviorSubject<Map<number, ItemStats[]>> = new BehaviorSubject(new Map<number, ItemStats[]>());
  events = {
    isDownloading: new BehaviorSubject<boolean>(true),
  };
  subs = new SubscriptionManager();
  doNotOrganize = false;
  isReady = false;


  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private dbService: DatabaseService,
    private itemService: ItemService,
    private tsmService: TsmService,
    private settingsSync: SettingsService,
    private characterService: CharacterService,
    private realmService: RealmService) {

    this.subs.add(
      this.realmService.events.realmStatus,
      (status: AuctionHouseStatus) =>
        this.getLatestData(status));

    this.subs.add(
      this.realmService.events.realmChanged,
      (status) => {
        if (this.isReady) {
          this.tsmService.get(status)
            .then(async () => await this.organize())
            .catch(console.error);
        }
      }
    );

    this.subs.add(TsmService.list, async () => {
      if (this.list.value.length > 0) {
        await this.organize();
      }
    });
  }

  getById(id: string | number, map: Map<string, AuctionItem> = this.mapped.value): AuctionItem {
    return map.get('' + id);
  }

  /**
   * Downloading Auction and auction stats data for the given realm
   * @param realmStatus
   * @param isForComparisons
   * @param ahTypeId
   */
  getAuctions(
    realmStatus: AuctionHouseStatus = this.realmService.events.realmStatus.value,
    isForComparisons?: boolean,
    ahTypeId: number = SharedService.user.ahTypeId
  ): Promise<OrganizedAuctionResult> {
    if (SharedService.downloading.auctions && !isForComparisons) {
      return new Promise((resolve) => resolve(undefined));
    }
    if (!isForComparisons) {
      this.events.isDownloading.next(true);
      SharedService.downloading.auctions = true;
    }
    console.log('Downloading auctions');
    this.openSnackbar(`Downloading auctions for ${SharedService.user.realm}`);
    let auctions;
    const statsMap = new Map<string, ItemStats>();
    const isStatusAvailable = realmStatus.stats && realmStatus.stats.url && !isForComparisons;
    /**
     * Stats and AH data URL's will contain an object instead of a string for classic realms
     * So in these cases, we will need to use the ahTypeId to get the correct URL.
     */
    const url = typeof realmStatus.url === 'string' ? realmStatus.url : realmStatus.url[ahTypeId || 2];
    const statusUrl = isStatusAvailable ? (
      typeof realmStatus.stats.url === 'string' ? realmStatus.stats.url : realmStatus.stats.url[ahTypeId]
    ) : undefined;

    const promises = [
      new Promise((resolve, reject) => {
        this.http
          .get(url)
          .toPromise()
          .then(data => {
            auctions = data['auctions'];
            resolve(auctions);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      })
    ];

    /**
     * Downloading stats data if available
     */
    if (isStatusAvailable && statusUrl) {
      promises.push(new Promise((resolve, reject) => {
        this.http
          .get(`${statusUrl}?lastModified=${realmStatus.stats.lastModified}`)
          .toPromise()
          .then(({data}: { data: ItemStats[] }) => {
            const variations = new Map<number, ItemStats[]>();
            data.forEach(stat => {
              statsMap.set(AuctionItemStat.getId(
                stat.itemId, stat.petSpeciesId, (stat.bonusIds as number[])
              ), stat);
              if (!variations.has(stat.itemId)) {
                variations.set(stat.itemId, []);
              }
              variations.get(stat.itemId).push(stat);
            });
            this.statsVariations.next(variations);
            this.stats.next(statsMap);
            resolve(statsMap);
          })
          .catch(error => {
            reject(error);
          });
      }));
    }
    return new Promise<OrganizedAuctionResult>((resolve, reject) => {
      Promise.all(promises)
        .then(async () => {
          console.log('Auction download is completed');
          localStorage['timestamp_auctions'] = realmStatus.lastModified;
          let organizedResults: OrganizedAuctionResult;
          // if (!this.doNotOrganize && !realmStatus.isInitialLoad) {
          await this.organize(auctions, isForComparisons)
            .then(result => organizedResults = result)
            .catch(error => ErrorReport.sendError('getAuctions', error));
          // }

          this.openSnackbar(`Auction download is completed`);

          this.handleNotifications();
          if (!isForComparisons) {
            this.auctions.next(auctions);
          }
          SharedService.downloading.auctions = false;
          this.events.isDownloading.next(false);
          resolve(organizedResults);
        })
        .catch((error: HttpErrorResponse) => {
          SharedService.downloading.auctions = false;
          this.events.isDownloading.next(false);
          console.error('Auction download failed', error);
          switch (error.status) {
            case 504:
              this.openSnackbar(`Auction download failed. The server took too long time to respond`);
              break;
            default:
              this.openSnackbar(`Auction download failed (${error.status} - ${error.statusText})`);
          }

          ErrorReport.sendHttpError(error);
          reject(error);
        });
    });
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', {duration: 3000});
  }

  private getLatestData(status: AuctionHouseStatus) {
    if (!status) {
      return;
    }

    const previousLastModified = +localStorage['timestamp_auctions'];
    if (this.shouldDownload(status, previousLastModified) || status.ahTypeIsChanged) {
      this.getAuctions()
        .catch(console.error);
    }
  }

  private shouldDownload(status: AuctionHouseStatus, previousLastModified) {
    return this.isNewUpdateAvailable(status, previousLastModified) || this.isAuctionArrayEmpty(status);
  }

  private isNewUpdateAvailable(status: AuctionHouseStatus, previousLastModified) {
    return status && status.lastModified !== previousLastModified && !SharedService.downloading.auctions;
  }

  private isAuctionArrayEmpty(status: AuctionHouseStatus) {
    const list = this.auctions.value;
    return status && status.lastModified && list && list.length === 0 && !SharedService.downloading.auctions;
  }

  private handleNotifications() {
    this.sendNewAuctionDataAvailable();
  }

  private sendNewAuctionDataAvailable() {
    const settings: UserSettings = this.settingsSync.settings.value;
    if (settings && settings.notifications && settings.notifications.isUpdateAvailable) {
      Notifications.send(
        'WAH - New auction data',
        `There are new auctions available for ${SharedService.user.realm}.`);
    }
  }

  organize(auctions: Auction[] = this.auctions.value, doNotTriggerEvents?: boolean): Promise<OrganizedAuctionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isReady || !auctions.length) {
        resolve(undefined);
        return;
      }
      // this.characterService.updateCharactersForRealmAndRecipes();
      AuctionUtil.organize(auctions, this.stats.value)
        .then(({
                 map,
                 list,
                 auctions: auc,
                 mapVariations,
               }) => {
          if (!doNotTriggerEvents) {
            CraftingUtil.calculateCost(true, map, mapVariations);
            this.mappedVariations.next(mapVariations);
            this.auctions.next(auctions);
            this.list.next(list);
            this.mapped.next(map);
            SharedService.events.auctionUpdate.emit(true);
          }
          resolve({
            map,
            list,
            auctions,
            mapVariations
          });
        })
        .catch(error => {
          ErrorReport.sendError('getAuctions', error);
          reject(error);
        });
    });
  }
}