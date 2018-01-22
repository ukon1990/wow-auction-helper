import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { ItemService } from '../../../services/item.service';
import { CraftingService } from '../../../services/crafting.service';
import { AuctionsService } from '../../../services/auctions.service';
import { PetsService } from '../../../services/pets.service';
import { DatabaseService } from '../../../services/database.service';
import { TSM } from '../../../models/auction/tsm';
import { AuctionHandler } from '../../../models/auction/auction-handler';
import { Crafting } from '../../../models/crafting/crafting';
import { Angulartics2 } from 'angulartics2/angulartics2';
import { Realm } from '../../../models/realm';
import { RealmService } from '../../../services/realm.service';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
  checkingForUpdates: boolean;
  lastCheckedMin;
  timeSinceUpdate = 0;
  constructor(
    private _realmService: RealmService,
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private _dbService: DatabaseService,
    private angulartics2: Angulartics2) { }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      await this._realmService.getRealms();
      await this._itemService.getItems();
      await this._petService.getPets();
      await this._craftingService.getRecipes()
        .then(r => Crafting.checkForMissingRecipes(this._craftingService));
      if (SharedService.user.apiToUse === 'tsm') {
        if (new Date().toDateString() !== localStorage['timestamp_tsm']) {
          await this._auctionsService.getTsmAuctions();
        } else {
          await this._dbService.getTSMItems()
            .then(r => {
              if (Object.keys(SharedService.tsm).length === 0) {
                this._auctionsService.getTsmAuctions();
              }
            })
            .catch(e => {
              console.error('Could not restore TSM data', e);
              this._auctionsService.getTsmAuctions();
            });
        }
      }
      await this._dbService.getAllAuctions()
        .then(r => {
          if (SharedService.auctions.length === 0) {
            this._auctionsService.getLastModifiedTime();
          }
        })
        .catch(e => {
          console.error('Could not restore auctions from DB');
          if (SharedService.auctions.length === 0) {
            this._auctionsService.getLastModifiedTime();
          }
        });

      this.timeSinceUpdate = this.milliSecondsToMinutes();

      setInterval(() => this.setLastUpdateAvailableTime(), 10000);
    }
  }

  /* istanbul ignore next */
  isUsingTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  getUserRealm(): Realm {
    return SharedService.realms[SharedService.user.realm];
  }

  /* istanbul ignore next */
  async download(type: string) {
    this.angulartics2.eventTrack.next({
      action: type,
      properties: { category: 'Manual download' },
    });
    switch (type) {
      case 'tsm':
        await this._auctionsService.getTsmAuctions();
        AuctionHandler.organize(SharedService.auctions);
        break;
      case 'auctions':
        this._auctionsService.getLastModifiedTime(true);
        break;
      case 'items':
        this._itemService.getItems();
        break;
      case 'pets':
        this._petService.getPets();
        break;
      case 'recipes':
        this._craftingService.getRecipes();
        break;
    }
  }

  /* istanbul ignore next */
  getAuctionsLastModified(): number {
    return SharedService.auctionResponse.lastModified;
  }

  /* istanbul ignore next */
  getTime(param: string): string {
    return localStorage[param];
  }

  /* istanbul ignore next */
  getDownloading() {
    return SharedService.downloading;
  }

  /* istanbul ignore next */
  isDownloading(): boolean {
    return SharedService.isDownloading();
  }

  setLastUpdateAvailableTime(): void {
    const timeSince = this.milliSecondsToMinutes(),
      lastModified = SharedService.auctionResponse ? SharedService.auctionResponse.lastModified : undefined;

    if (!this.checkingForUpdates) {
      this.checkingForUpdates = true;
      this._auctionsService.getLastModifiedTime()
        .then(r => {
          if (SharedService.auctionResponse.lastModified !== lastModified) {
            this.lastCheckedMin = undefined;
            this.checkingForUpdates = false;
          } else {
            this.lastCheckedMin = timeSince;
            this.checkingForUpdates = false;
          }
        });
    }
    this.timeSinceUpdate = timeSince;
  }

  private milliSecondsToMinutes(): number {
    if (!SharedService.auctionResponse) {
      return 0;
    }
    const ms = new Date().getTime() - (SharedService.auctionResponse.lastModified);
    return Math.round(ms / 60000);
  }
}
