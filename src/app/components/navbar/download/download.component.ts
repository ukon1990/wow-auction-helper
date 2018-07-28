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
import { Angulartics2 } from 'angulartics2';
import { Realm } from '../../../models/realm';
import { RealmService } from '../../../services/realm.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
  checkingForUpdates: boolean;
  lastCheckedMin;
  timeSinceUpdate = 0;
  realmControl: FormControl = new FormControl();
  downloadProgress = '';

  timestamps = {
    items: localStorage['timestamp_items'],
    pets: localStorage['timestamp_pets'],
    recipes: localStorage['timestamp_recipes'],
    auctions: localStorage['timestamp_auctions'],
    tsm: localStorage['timestamp_tsm'],
    wowuction: localStorage['timestamp_wowuction']
  };

  constructor(
    private _realmService: RealmService,
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private _dbService: DatabaseService,
    private angulartics2: Angulartics2) {
      this.realmControl.valueChanges.subscribe(realm => {
        console.log('realm change', realm);
      });

      setInterval(() => {
        this.timestamps.items = localStorage['timestamp_items'];
        this.timestamps.pets = localStorage['timestamp_pets'];
        this.timestamps.recipes = localStorage['timestamp_recipes'];
        this.timestamps.auctions = localStorage['timestamp_auctions'];
        this.timestamps.tsm = localStorage['timestamp_tsm'];
        this.timestamps.wowuction = localStorage['timestamp_wowuction'];
      }, 1000);
    }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      this.downloadProgress = 'Downloading realms';
      await this._realmService.getRealms()
        .catch(error => console.error(error));
      this.downloadProgress = 'Loading items from disk';
      this._dbService.getAllItems()
        .then(async() => {
          if (Object.keys(SharedService.items).length) {
            await this.download('items');
          }
        })
        .catch(async error => {
          console.error(error);
          await this.download('items');
        });
      this.downloadProgress = 'Downloading pets';
      await this._petService.getPets();
      this.downloadProgress = 'Downloading recipes';
      await this._dbService.getAllRecipes()
        .then(async () => {
          if (SharedService.recipes.length === 0) {
            await this._craftingService.getRecipes()
              .then(r => Crafting.checkForMissingRecipes(this._craftingService));
          }
        })
        .catch(async (error) => {
          await this.download('recipes');
        });
      if (SharedService.user.apiToUse === 'tsm') {
        if (new Date().toDateString() !== localStorage['timestamp_tsm']) {
          this.downloadProgress = 'Downloading new TSM data';
          await this._auctionsService.getTsmAuctions();
        } else {
          this.downloadProgress = 'Loading TSM from disk';
          await this._dbService.getTSMItems()
            .then(r => {
              if (Object.keys(SharedService.tsm).length === 0) {
                this.downloadProgress = 'Downloading TSM data';
                this._auctionsService.getTsmAuctions();
              }
            })
            .catch(e => {
              console.error('Could not restore TSM data', e);
              this._auctionsService.getTsmAuctions();
            });
        }
      } else if (SharedService.user.apiToUse === 'wowuction') {
        if (new Date().toDateString() !== localStorage['timestamp_wowuction']) {
          this.downloadProgress = 'Downloading new wowuction data';
          await this._auctionsService.getWoWUctionAuctions();
        } else {
          this.downloadProgress = 'Loading wowuction from disk';
          await this._dbService.getWoWUctionItems()
            .then(r => {
              if (Object.keys(SharedService.wowUction).length === 0) {
                this.downloadProgress = 'Downloading wowuction data';
                this._auctionsService.getWoWUctionAuctions();
              }
            })
            .catch(e => {
              console.error('Could not restore WoWUction data', e);
              this._auctionsService.getWoWUctionAuctions();
            });
        }
      }

      this.downloadProgress = 'Loading auctions from disk';
      await this._dbService.getAllAuctions(this._petService)
        .then(r => {
          if (SharedService.auctions.length === 0) {
            this.downloadProgress = 'Downloading new auctions';
            this._auctionsService.getLastModifiedTime(true);
          }
        })
        .catch(e => {
          console.error('Could not restore auctions from DB');
          if (SharedService.auctions.length === 0) {
            this._auctionsService.getLastModifiedTime();
          }
        });

      this.timeSinceUpdate = this.milliSecondsToMinutes();
      await this.setLastUpdateAvailableTime();
      setInterval(() => this.setLastUpdateAvailableTime(), 5000);
    }
  }

  /* istanbul ignore next */
  isUsingTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  /* istanbul ignore next */
  isUsingWowUction(): boolean {
    return SharedService.user.apiToUse === 'wowuction';
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
      case 'wowuction':
        this.downloadProgress = 'Downloading wowuction data';
        await this._auctionsService.getWoWUctionAuctions();
        AuctionHandler.organize(SharedService.auctions);
        break;
      case 'tsm':
        this.downloadProgress = 'Downloading TSM data';
        await this._auctionsService.getTsmAuctions();
        AuctionHandler.organize(SharedService.auctions);
        break;
      case 'auctions':
        this.downloadProgress = 'Downloading new auctions';
        await this._auctionsService.getLastModifiedTime(true);
        break;
      case 'items':
        this.downloadProgress = 'Downloading items';
        await this._itemService.getItems();
        break;
      case 'pets':
        this.downloadProgress = 'Downloading pets';
        await this._petService.getPets();
        break;
      case 'recipes':
        this.downloadProgress = 'Downloading recipes';
        await this._craftingService.getRecipes();
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

  getUserRealms(): Array<Realm> {
    return SharedService.userRealms ? SharedService.userRealms : [];
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
            this.downloadProgress = 'Downloading new auctions';
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
