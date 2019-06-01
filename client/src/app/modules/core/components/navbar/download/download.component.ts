import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Angulartics2} from 'angulartics2';
import {SharedService} from '../../../../../services/shared.service';
import {ItemService} from '../../../../../services/item.service';
import {CraftingService} from '../../../../../services/crafting.service';
import {AuctionsService} from '../../../../../services/auctions.service';
import {PetsService} from '../../../../../services/pets.service';
import {DatabaseService} from '../../../../../services/database.service';
import {RealmService} from '../../../../../services/realm.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Report} from '../../../../../utils/report.util';
import {RealmStatus} from '../../../../../models/realm-status.model';
import {Dashboard} from '../../../../dashboard/models/dashboard.model';
import {Crafting} from '../../../../../models/crafting/crafting';
import {Realm} from '../../../../../models/realm';
import {AuctionHandler} from '../../../../../models/auction/auction-handler';

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
  subs = new SubscriptionManager();

  timestamps = {
    items: localStorage['timestamp_items'],
    pets: localStorage['timestamp_pets'],
    recipes: localStorage['timestamp_recipes'],
    auctions: localStorage['timestamp_auctions'],
    tsm: localStorage['timestamp_tsm'],
    wowuction: localStorage['timestamp_wowuction']
  };
  private realmStatus: RealmStatus;

  constructor(
    private _realmService: RealmService,
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private _dbService: DatabaseService,
    private angulartics2: Angulartics2) {


    setInterval(() => {
      this.timestamps.items = localStorage['timestamp_items'];
      this.timestamps.pets = localStorage['timestamp_pets'];
      this.timestamps.recipes = localStorage['timestamp_recipes'];
      this.timestamps.auctions = localStorage['timestamp_auctions'];
      this.timestamps.tsm = localStorage['timestamp_tsm'];
      this.timestamps.wowuction = localStorage['timestamp_wowuction'];
    }, 1000);

    this.subs.add(
      this._realmService.events.realmStatus,
      (status) => this.setRealmStatus(status));

    Dashboard.addLoadingDashboards();
  }

  private setRealmStatus(status: RealmStatus) {
    this.realmStatus = status;
    /*if (timeSince < 15) {
      return;
    }*/
  }

  async ngOnInit() {
    if (SharedService.user.realm || SharedService.user.region) {
      this.downloadProgress = 'Downloading realms';
      await this._realmService.getRealms()
        .catch(error => console.error(error));

      this.downloadProgress = 'Loading items from disk';
      await this._dbService.getAllItems()
        .then(async () => {
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

      await this.startRealmStatusInterval();
      await this._dbService.getTSMAddonData();
      this.downloadProgress = '';
    }
    // TODO: Later => this._itemService.addMissingItems();
  }

  getMessage(): string {
    if (this.downloadProgress.length > 0) {
      return this.downloadProgress;
    } else if (SharedService.downloading.auctions) {
      return 'Downloading auction data';
    } else if (SharedService.downloading.tsmAuctions) {
      return 'Downloading TSM data';
    } else if (SharedService.downloading.wowUctionAuctions) {
      return 'Downloading WoWuction data';
    } else if (SharedService.downloading.items) {
      return 'Downloading item data';
    } else if (SharedService.downloading.pets) {
      return 'Downloading pet data';
    } else if (SharedService.downloading.recipes) {
      return 'Downloading recipe data';
    } else if (SharedService.downloading.characterData) {
      return 'Downloading character data';
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
      Report.send(type, 'Manual download');
    }
    switch (type) {
      case 'tsm':
        this.downloadTSM();
        break;
      case 'auctions':
        this.downloadAuctions();
        break;
      case 'items':
        this.downloadItems(forceUpdate);
        break;
      case 'pets':
        this.downloadPets(forceUpdate);
        break;
      case 'recipes':
        this.downloadRecipes(forceUpdate);
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


  private milliSecondsToMinutes(status: RealmStatus): number {
    if (!SharedService.auctionResponse || !status) {
      return 0;
    }
    const ms = new Date().getTime() - (status.lastModified);
    return Math.round(ms / 60000);
  }

  private isOnline(): boolean {
    return navigator.onLine;
  }

  private async startRealmStatusInterval() {
    await this.updateRealmStatus();
    setInterval(() =>
      this.updateRealmStatus(), 10000);
  }

  private updateRealmStatus(): Promise<any> {
    this.timeSinceUpdate = this.milliSecondsToMinutes(this.realmStatus);
    return new Promise<any>((resolve, reject) => {
      if (this.shouldUpdateRealmStatus()) {
        this.checkingForUpdates = true;
        this._realmService.getStatus(
          SharedService.user.region,
          SharedService.user.realm)
          .then((status) => {
            this.checkingForUpdates = false;
            resolve();
          })
          .catch((error) => {
            this.checkingForUpdates = false;
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }

  private shouldUpdateRealmStatus() {
    return !this.checkingForUpdates &&
      this.isOnline() &&
      this.shouldAnUpdateShouldBeAvailableSoon();
  }

  private shouldAnUpdateShouldBeAvailableSoon() {
    return !this.realmStatus ||
      this.realmStatus.lowestDelay - this.timeSinceUpdate < 1;
  }

  private async downloadAuctions() {
    this.downloadProgress = 'Downloading new auctions';
    await this._realmService.getStatus(SharedService.user.region, SharedService.user.realm);
    await this._auctionsService.getAuctions();
  }

  private async downloadTSM() {
    this.downloadProgress = 'Downloading TSM data';
    await this._auctionsService.getTsmAuctions();
    AuctionHandler.organize(SharedService.auctions);
  }

  private async downloadPets(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_pets'];
    }

    this.downloadProgress = 'Downloading pets';
    await this._petService.getPets();

    if (forceUpdate) {
      AuctionHandler.organize(SharedService.auctions);
    }
  }

  private async downloadRecipes(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_recipes'];
    }
    this.downloadProgress = 'Downloading recipes';
    await this._craftingService.getRecipes();

    if (forceUpdate) {
      AuctionHandler.organize(SharedService.auctions);
    }
  }

  private async downloadItems(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_items'];
    }

    this.downloadProgress = 'Downloading items';
    await this._itemService.getItems();

    if (forceUpdate) {
      AuctionHandler.organize(SharedService.auctions);
    }
  }
}
