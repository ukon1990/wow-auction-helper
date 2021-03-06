import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SharedService} from './shared.service';
import {AuctionUtil} from '../modules/auction/utils/auction.util';
import {DatabaseService} from './database.service';
import {ItemService} from './item.service';
import {Notifications} from '../models/user/notification';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ErrorReport} from '../utils/error-report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {BehaviorSubject} from 'rxjs';
import {Auction} from '../modules/auction/models/auction.model';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {RealmService} from './realm.service';
import {AuctionHouseStatus} from '../modules/auction/models/auction-house-status.model';
import {TsmService} from '../modules/tsm/tsm.service';
import {CharacterService} from '../modules/character/services/character.service';
import {CraftingUtil} from '../modules/crafting/utils/crafting.util';
import {SettingsService} from '../modules/user/services/settings/settings.service';
import {UserSettings} from '../modules/user/models/settings.model';
import {ItemStats} from '../../../../api/src/auction/models/item-stats.model';
import {AuctionItemStat} from '../../../../api/src/auction/models/auction-item-stat.model';

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

  getAuctions(): Promise<any> {
    if (SharedService.downloading.auctions) {
      return;
    }
    this.events.isDownloading.next(true);
    const realmStatus: AuctionHouseStatus = this.realmService.events.realmStatus.getValue();
    console.log('Downloading auctions');
    SharedService.downloading.auctions = true;
    this.openSnackbar(`Downloading auctions for ${SharedService.user.realm}`);
    let auctions;
    const statsMap = new Map<string, ItemStats>();
    return Promise.all([
      new Promise((resolve, reject) => {
        this.http
          .get(`${realmStatus.stats.url}?lastModified=${realmStatus.stats.lastModified}`)
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
      }),
      new Promise((resolve, reject) => {
        this.http
          .get(realmStatus.url)
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
    ])
      .then(async () => {
        console.log('Auction download is completed');
        SharedService.downloading.auctions = false;
        localStorage['timestamp_auctions'] = realmStatus.lastModified;
        // if (!this.doNotOrganize && !realmStatus.isInitialLoad) {
        await this.organize(auctions)
          .catch(error => ErrorReport.sendError('getAuctions', error));
        // }

        this.openSnackbar(`Auction download is completed`);

        this.handleNotifications();
        this.auctions.next(auctions);
        this.events.isDownloading.next(true);
      })
      .catch((error: HttpErrorResponse) => {
        SharedService.downloading.auctions = false;
        this.events.isDownloading.next(true);
        console.error('Auction download failed', error);
        switch (error.status) {
          case 504:
            this.openSnackbar(`Auction download failed. The server took too long time to respond`);
            break;
          default:
            this.openSnackbar(`Auction download failed (${error.status} - ${error.statusText})`);
        }

        ErrorReport.sendHttpError(error);
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
    if (this.shouldDownload(status, previousLastModified)) {
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

  async organize(auctions: Auction[] = this.auctions.value) {
    if (!this.isReady || !auctions.length) {
      return;
    }
    // this.characterService.updateCharactersForRealmAndRecipes();
    await AuctionUtil.organize(auctions, this.stats.value)
      .then(({
               map,
               list,
               auctions: auc,
               mapVariations,
             }) => {
        CraftingUtil.calculateCost(true, map, mapVariations);
        this.mappedVariations.next(mapVariations);
        this.auctions.next(auctions);
        this.list.next(list);
        this.mapped.next(map);
        SharedService.events.auctionUpdate.emit(true);
      })
      .catch(error => ErrorReport.sendError('getAuctions', error));
  }
}
