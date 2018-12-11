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
import { Dashboard } from '../../../models/dashboard';

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

  // TODO: While navigator.onLine === false for downloads
  offlineInterval;

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

    Dashboard.addLoadingDashboards();
    }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      this.downloadProgress = 'Downloading realms';
      await this._realmService.getRealms()
        .catch(error => console.error(error));

      this.downloadProgress = 'Loading items from disk';
      await this._dbService.getAllItems()
        .then(async() => {
          if (Object.keys(SharedService.items).length === 0) {
            delete localStorage['timestamp_items'];
          }
        })
        .catch(async error => {
          console.error(error);
        });

      if (this.isOnline()) {
        await this.download('items');
      }

      this.downloadProgress = 'Loading pets from disk';
      await this._dbService.getAllPets()
        .then(async () => {
          if (Object.keys(SharedService.pets).length === 0) {
            delete localStorage['timestamp_pets'];
            this.downloadProgress = 'Downloading pets';
          }
        })
        .catch(async error => {
        });
      this.downloadProgress = 'Downloading pets';

      if (this.isOnline()) {
        await this.download('pets');
      }

      this.downloadProgress = 'Downloading recipes';
      await this._dbService.getAllRecipes()
        .then(async () => {
          if (SharedService.recipes.length === 0) {
            delete localStorage['timestamp_recipes'];
          }
        })
        .catch(async (error) => {
        });

      if (this.isOnline()) {
        await this.download('recipes');
        await Crafting.checkForMissingRecipes(this._craftingService);
      }

      Crafting.setOnUseCraftsWithNoReagents();

      if (SharedService.user.apiToUse === 'tsm') {
        if (new Date().toDateString() !== localStorage['timestamp_tsm'] && this.isOnline()) {
          this.downloadProgress = 'Downloading new TSM data';
          await this._auctionsService.getTsmAuctions();
        } else {
          this.downloadProgress = 'Loading TSM from disk';
          await this._dbService.getTSMItems()
            .then(async r => {
              if (Object.keys(SharedService.tsm).length === 0 && this.isOnline()) {
                this.downloadProgress = 'Downloading TSM data';
                await this._auctionsService.getTsmAuctions();
              }
            })
            .catch(async e => {
              console.error('Could not restore TSM data', e);
              await this._auctionsService.getTsmAuctions();
            });
        }
      } else if (SharedService.user.apiToUse === 'wowuction') {
        if (new Date().toDateString() !== localStorage['timestamp_wowuction'] && this.isOnline()) {
          this.downloadProgress = 'Downloading new wowuction data';
          await this._auctionsService.getWoWUctionAuctions();
        } else {
          this.downloadProgress = 'Loading wowuction from disk';
          await this._dbService.getWoWUctionItems()
            .then(async r => {
              if (Object.keys(SharedService.wowUction).length === 0 && this.isOnline()) {
                this.downloadProgress = 'Downloading wowuction data';
                await this._auctionsService.getWoWUctionAuctions();
              }
            })
            .catch(async e => {
              console.error('Could not restore WoWUction data', e);
              await this._auctionsService.getWoWUctionAuctions();
            });
        }
      }

      this.downloadProgress = 'Loading auctions from disk';
      await this._dbService.getAllAuctions(this._petService)
        .then(r => {
          if (SharedService.auctions.length === 0 && this.isOnline()) {
            this.downloadProgress = 'Downloading new auctions';
            this._auctionsService.getLastModifiedTime(true);
          }
        })
        .catch(e => {
          console.error('Could not restore auctions from DB');
          if (SharedService.auctions.length === 0 && this.isOnline()) {
            this._auctionsService.getLastModifiedTime();
          }
        });

      this.timeSinceUpdate = this.milliSecondsToMinutes();
      await this.setLastUpdateAvailableTime();
      setInterval(() =>
        this.setLastUpdateAvailableTime(), 5000);
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
  async download(type: string, forceUpdate?: boolean) {
    if (forceUpdate) {
      this.angulartics2.eventTrack.next({
        action: type,
        properties: { category: 'Manual download' },
      });
    }
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
        if (forceUpdate) {
          delete localStorage['timestamp_items'];
        }

        this.downloadProgress = 'Downloading items';
        await this._itemService.getItems();

        if (forceUpdate) {
          AuctionHandler.organize(SharedService.auctions);
        }
        break;
      case 'pets':
        if (forceUpdate) {
          delete localStorage['timestamp_pets'];
        }

        this.downloadProgress = 'Downloading pets';
        await this._petService.getPets();

        if (forceUpdate) {
          AuctionHandler.organize(SharedService.auctions);
        }
        break;
      case 'recipes':
        if (forceUpdate) {
          delete localStorage['timestamp_recipes'];
        }
        this.downloadProgress = 'Downloading recipes';
        await this._craftingService.getRecipes();

        if (forceUpdate) {
          AuctionHandler.organize(SharedService.auctions);
        }
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

    if (!this.checkingForUpdates && this.isOnline()) {
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

  private isOnline(): boolean {
    return navigator.onLine;
  }
}
