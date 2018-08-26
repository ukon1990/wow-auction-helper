import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SharedService } from './shared.service';
import { AuctionHandler } from '../models/auction/auction-handler';
import { Dashboard } from '../models/dashboard';
import { TSM } from '../models/auction/tsm';
import { Endpoints } from './endpoints';
import { DatabaseService } from './database.service';
import { ItemService } from './item.service';
import { Notifications } from '../models/user/notification';
import { MatSnackBar } from '@angular/material';
import { WoWUction } from '../models/auction/wowuction';
import { PetsService } from './pets.service';
import { Item } from '../models/item/item';
import { Angulartics2 } from 'angulartics2';
import { ErrorReport } from '../utils/error-report.util';
import { Compression } from '../utils/compression.util';

@Injectable()
export class AuctionsService {

  constructor(
    private _http: HttpClient,
    public snackBar: MatSnackBar,
    private _dbService: DatabaseService,
    private _itemService: ItemService,
    private petService: PetsService,
    private angulartics2: Angulartics2) { }

  getLastModifiedTime(force?: boolean): Promise<any> {
    const previousLastModified = SharedService.auctionResponse ?
      SharedService.auctionResponse.lastModified : undefined;
    return this._http.get(Endpoints.getBattleNetApi(`auction/data/${SharedService.user.realm}`))
      .toPromise()
      .then(r => {
        SharedService.auctionResponse = r['files'][0];
        if (force || previousLastModified !== SharedService.auctionResponse.lastModified) {
          this.getAuctions()
            .then(res => {
              console.log('Updating auctions');
          }).catch();
        }
      })
      .catch(error => {
        console.error('Could not get last update time', error);
        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  getAuctions(): Promise<any> {
    if (SharedService.downloading.auctions) {
      return;
    }
    const missingItems = [];
    console.log('Downloading auctions');
    SharedService.downloading.auctions = true;
    this.openSnackbar(`Downloading auctions for ${ SharedService.user.realm }`);
    return this._http.post(
        Endpoints.getUrl('auction'), { url: SharedService.auctionResponse.url })
      .toPromise()
      .then(a => {
        if (a['isBase64Encoded']) {
          a = Compression.decompress(a['body']);
        }
        SharedService.downloading.auctions = false;
        localStorage['timestamp_auctions'] = SharedService.auctionResponse.lastModified;
        AuctionHandler.organize(a['auctions'], this.petService);
        this._dbService.addAuctions(a['auctions']);

        // Adding lacking items to the database
        SharedService.auctionItems.forEach(ai => {
          if (!SharedService.items[ai.itemID]) {
            console.log('Did not find ' + ai.itemID);
            missingItems.push(ai.itemID);
          }
        });
        if (missingItems.length < 100) {
          this._itemService.addItems(missingItems);
        } else {
          console.log('Attempting to download items again.');
          this._itemService.getItems();
        }
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
      })
      .catch((error: HttpErrorResponse) => {
        SharedService.downloading.auctions = false;
        console.error('Auction download failed', error);
        switch (error.status) {
          case 504:
            this.openSnackbar(`Auction download failed. The server took too long time to respond`);
            break;
          default:
            this.openSnackbar(`Auction download failed (${ error.status } - ${ error.statusText })`);
        }

        ErrorReport.sendHttpError(error, this.angulartics2);
      });
  }

  getAuctionsAndDecompress(): void {
    this._http.post('https://4m6c7drle0.execute-api.us-west-2.amazonaws.com/default/getAuctions', {
      url: 'http://auction-api-us.worldofwarcraft.com/auction-data/5301bfa3fe54bb793c685437da49ac42/auctions.json'
    }).toPromise()
    .then(r => {
      console.log('compressed response', r);
      Compression.decompress(r['body']);
    })
    .catch(error => console.error(error));
  }

  getTsmAuctions(): Promise<any> {
    console.log('Downloading TSM data');
    SharedService.downloading.tsmAuctions = true;
    this.openSnackbar('Downloading TSM data');
    return this._http.get(`${Endpoints.TSM_API}/${
      SharedService.user.region
      }/${
      SharedService.user.realm
      }?format=json&apiKey=${
      SharedService.user.apiTsm
      }`) // 'assets/mock/tsm.json'
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
          ErrorReport.sendHttpError(error, this.angulartics2);
        });
      });
  }

  getWoWUctionAuctions(): Promise<any> {
    console.log('Downloading WoWUction data');
    SharedService.downloading.wowUctionAuctions = true;
    this.openSnackbar('Downloading WoWUction data');
    return this._http.post(`${Endpoints.getUrl('auction/wowuction')}`,
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
        ErrorReport.sendHttpError(error, this.angulartics2);

        this._dbService.getWoWUctionItems().then(r => {
          this.openSnackbar(`Using the previously used WoWUction data instead (from local DB) if available`);
        }).catch(err => {
          console.error('Could not restore WoWUction auctions from local DB', err);
        });
      });
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}
