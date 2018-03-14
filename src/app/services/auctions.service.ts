import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
import { AuctionHandler } from '../models/auction/auction-handler';
import { Dashboard } from '../models/dashboard';
import { TSM } from '../models/auction/tsm';
import { Endpoints } from './endpoints';
import { DatabaseService } from './database.service';
import { ItemService } from './item.service';
import { Notifications } from '../models/user/notification';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class AuctionsService {

  constructor(
    private _http: HttpClient,
    public snackBar: MatSnackBar,
    private _dbService: DatabaseService,
    private _itemService: ItemService) { }

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
      .catch(e => console.error('Could not get last update time', e));
  }

  getAuctions(): Promise<any> {
    console.log('Downloading auctions');
    SharedService.downloading.auctions = true;
    this.openSnackbar(`Downloading auctions for ${ SharedService.user.realm }`);
    return this._http.get(Endpoints.getAuctionDownloadUrl())
      .toPromise()
      .then(a => {
        SharedService.downloading.auctions = false;
        localStorage['timestamp_auctions'] = SharedService.auctionResponse.lastModified;
        AuctionHandler.organize(a['auctions']);
        this._dbService.addAuctions(a['auctions']);

        // Adding lacking items to the database
        SharedService.auctionItems.forEach(ai => {
          if (!SharedService.items[ai.itemID]) {
            console.log('Did not find ' + ai.itemID);
            this._itemService.addItem(ai.itemID);
          }
        });
        console.log('Auction download is completed');
        this.openSnackbar(`Auction download is completed`);

        if (SharedService.user.notifications.isUndercut) {
          Notifications.send(
            'WAH - Auction data just got updated',
            `${SharedService.userAuctions.undercutAuctions} of your auctions were undercut.`
          );
        }
      })
      .catch(e => {
        SharedService.downloading.auctions = false;
        console.error('Auction download failed', e);
        this.openSnackbar(`Auction download failed`);
      });
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
        this.openSnackbar(`Completed TSM download. One reason that this could happen, is if you have used all your requests.`);
        console.error('Unable to download TSM data', e);
        SharedService.downloading.tsmAuctions = false;
      });
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}
