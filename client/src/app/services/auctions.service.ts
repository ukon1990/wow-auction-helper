import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SharedService} from './shared.service';
import {AuctionHandler} from '../models/auction/auction-handler';
import {TSM} from '../models/auction/tsm';
import {Endpoints} from './endpoints';
import {DatabaseService} from './database.service';
import {ItemService} from './item.service';
import {Notifications} from '../models/user/notification';
import {MatSnackBar} from '@angular/material';
import {WoWUction} from '../models/auction/wowuction';
import {PetsService} from './pets.service';
import {Angulartics2} from 'angulartics2';
import {ErrorReport} from '../utils/error-report.util';
import {AuctionResponse} from '../models/auction/auctions-response';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {BehaviorSubject} from 'rxjs';
import {Auction} from '../models/auction/auction';
import {AuctionItem} from '../models/auction/auction-item';
import {RealmService} from './realm.service';
import {RealmStatus} from '../models/realm-status.model';

@Injectable()
export class AuctionsService {
  events = {
    list: new BehaviorSubject<Auction[]>([]),
    groupedList: new BehaviorSubject<AuctionItem[]>([])
  };
  subs = new SubscriptionManager();


  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private _dbService: DatabaseService,
    private _itemService: ItemService,
    private petService: PetsService,
    private realmService: RealmService,
    private angulartics2: Angulartics2) {
    this.subs.add(
      this.realmService.events.realmStatus,
      (status: RealmStatus) =>
        this.getLatestData(status));
  }

  getLastModifiedTime(force?: boolean): Promise<any> {
    const previousLastModified = SharedService.auctionResponse ?
      SharedService.auctionResponse.lastModified : undefined;
    return this.http.post(
      Endpoints.getLambdaUrl(`auction`, SharedService.user.region), {
        region: SharedService.user.region,
        realm: SharedService.user.realm
      })
      .toPromise()
      .then(r => {
        SharedService.auctionResponse = r as AuctionResponse;
        if (force || previousLastModified !== SharedService.auctionResponse.lastModified) {
          this.getAuctions()
            .then(res => {
              console.log('Updating auctions');
            }).catch();
        }
      })
      .catch(error => {
        console.error('Could not get last update time', error);
        ErrorReport.sendHttpError(error);
      });
  }

  getAuctions(): Promise<any> {
    if (SharedService.downloading.auctions) {
      return;
    }
    const missingItems = [],
      realmStatus: RealmStatus = this.realmService.events.realmStatus.getValue();
    console.log('Downloading auctions');
    SharedService.downloading.auctions = true;
    this.openSnackbar(`Downloading auctions for ${SharedService.user.realm}`);
    return this.http
      .get(realmStatus.url)
      .toPromise()
      .then(async a => {
        SharedService.downloading.auctions = false;
        localStorage['timestamp_auctions'] = realmStatus.lastModified;
        await AuctionHandler.organize(a['auctions'], this.petService);

        // Adding lacking items to the database
        this.handleMissingAuctionItems(missingItems);
        console.log('Auction download is completed');
        this.openSnackbar(`Auction download is completed`);

        if (SharedService.user.notifications.isUndercut) {
          try {
            Notifications.send(
              'WAH - Auction data just got updated',
              `${SharedService.userAuctions.undercutAuctions} of your auctions were undercut.`
            );
          } catch (e) {
            console.error('Could not send notification', e);
          }
        }
        SharedService.events.auctionUpdate.emit();
        this.events.list.next(a['auctions']);
        this.events.groupedList.next(SharedService.auctionItems);
      })
      .catch((error: HttpErrorResponse) => {
        SharedService.downloading.auctions = false;
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

  private handleMissingAuctionItems(missingItems) {
    SharedService.auctionItems.forEach(ai => {
      if (!SharedService.items[ai.itemID]) {
        missingItems.push(ai.itemID);
      }
    });
    if (missingItems.length < 100) {
      this._itemService.addItems(missingItems);
    } else {
      console.log('Attempting to download items again.');
      this._itemService.getItems();
    }
  }

  getTsmAuctions(): Promise<any> {
    const region = SharedService.user.region;
    if (region === 'eu' || region === 'us') {
      console.log('Downloading TSM data');
      SharedService.downloading.tsmAuctions = true;
      this.openSnackbar('Downloading TSM data');
      return this.http.get(`${Endpoints.TSM_API}/${
        SharedService.user.region
        }/${
        SharedService.user.realm
        }?format=json&apiKey=${
        SharedService.user.apiTsm
        }&fields=Id,MarketValue,RegionSaleAvg,RegionAvgDailySold,RegionSaleRate`) // 'assets/mock/tsm.json'
        .toPromise()
        .then(tsm => {
          localStorage['timestamp_tsm'] = new Date().toDateString();
          (<TSM[]>tsm).forEach(a => {
            SharedService.tsm[a.Id] = a;
          });
          SharedService.downloading.tsmAuctions = false;
          console.log('TSM data download is complete');
          this._dbService.addTSMItems(tsm as Array<TSM>);
          this.openSnackbar('Completed TSM download');
        })
        .catch(e => {
          this.openSnackbar(`Could not completed TSM download. One reason that this could happen, is if you have used all your requests.`);
          console.error('Unable to download TSM data', e);
          SharedService.downloading.tsmAuctions = false;
          this._dbService.getTSMItems().then(r => {
            this.openSnackbar(`Using the previously used TSM data instead (from local DB) if available`);
          }).catch(error => {
            console.error('Could not restore TSM auctions from local DB', error);
            ErrorReport.sendHttpError(error);
          });
        });
    } else {
      return new Promise((resolve) => []);
    }
  }

  getWoWUctionAuctions(): Promise<any> {
    const region = SharedService.user.region;

    if (region === 'eu' || region === 'us') {
      console.log('Downloading WoWUction data');
      SharedService.downloading.wowUctionAuctions = true;
      this.openSnackbar('Downloading WoWUction data');
      return this.http.post(`${Endpoints.getUrl('auction/wowuction')}`,
        {
          region: SharedService.user.region,
          realm: SharedService.user.realm,
          key: SharedService.user.apiWoWu
        }).toPromise()
        .then(wowu => {
          localStorage['timestamp_wowuction'] = new Date().toDateString();
          (<WoWUction[]>wowu).forEach(a => {
            SharedService.wowUction[a.id] = a;
          });
          SharedService.downloading.wowUctionAuctions = false;
          console.log('WoWUction data download is complete');
          this._dbService.addWoWUctionItems(wowu as Array<WoWUction>);
          this.openSnackbar('Completed WoWUction download');
        })
        .catch(error => {
          this.openSnackbar(
            `Could not completed WoWUction download. One reason that this could happen, is if you have used all your requests.`);
          console.error('Unable to download WoWUction data', error);
          SharedService.downloading.wowUctionAuctions = false;
          ErrorReport.sendHttpError(error);

          this._dbService.getWoWUctionItems().then(r => {
            this.openSnackbar(`Using the previously used WoWUction data instead (from local DB) if available`);
          }).catch(err => {
            console.error('Could not restore WoWUction auctions from local DB', err);
          });
        });
    } else {
      return new Promise((resolve) => []);
    }
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', {duration: 3000});
  }

  private getLatestData(status: RealmStatus) {
    if (!status) {
      return;
    }

    const previousLastModified = +localStorage['timestamp_auctions'];
    if (this.shouldDownload(status, previousLastModified)) {
      this.getAuctions();
    }
  }

  private shouldDownload(status: RealmStatus, previousLastModified) {
    return this.isNewUpdateAvailable(status, previousLastModified) || this.isAuctionArrayEmpty(status);
  }

  private isNewUpdateAvailable(status: RealmStatus, previousLastModified) {
    return status && status.lastModified !== previousLastModified && !SharedService.downloading.auctions;
  }

  private isAuctionArrayEmpty(status: RealmStatus) {
    const list = this.events.list.getValue();
    return status && status.lastModified && list && list.length === 0 && !SharedService.downloading.auctions;
  }
}
