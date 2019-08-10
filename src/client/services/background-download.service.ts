import {Injectable} from '@angular/core';
import {RealmService} from './realm.service';
import {ItemService} from './item.service';
import {CraftingService} from './crafting.service';
import {AuctionsService} from './auctions.service';
import {PetsService} from './pets.service';
import {DatabaseService} from './database.service';
import {Report} from '../utils/report.util';
import {BehaviorSubject} from 'rxjs';
import {SharedService} from './shared.service';
import {DateUtil} from '@ukon1990/js-utilities';
import {RealmStatus} from '../models/realm-status.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {Dashboard} from '../modules/dashboard/models/dashboard.model';
import {AuctionUtil} from '../modules/auction/utils/auction.util';
import {Crafting} from '../modules/crafting/models/crafting';

@Injectable({
  providedIn: 'root'
})
export class BackgroundDownloadService {
  isLoading = new BehaviorSubject(false);
  timeSinceUpdate = new BehaviorSubject(0);

  timestamps = {
    items: localStorage['timestamp_items'],
    pets: localStorage['timestamp_pets'],
    recipes: localStorage['timestamp_recipes'],
    auctions: localStorage['timestamp_auctions'],
    tsm: localStorage['timestamp_tsm'],
    wowuction: localStorage['timestamp_wowuction']
  };
  private checkingForUpdates: boolean;
  private realmStatus: RealmStatus;
  private subs = new SubscriptionManager();

  constructor(
    private realmService: RealmService,
    private itemService: ItemService,
    private craftingService: CraftingService,
    private auctionsService: AuctionsService,
    private petService: PetsService,
    private dbService: DatabaseService) {


    this.subs.add(
      this.realmService.events.realmStatus,
      (status) =>
        this.realmStatus = status);


    setInterval(() => {
      this.timestamps.items = localStorage['timestamp_items'];
      this.timestamps.pets = localStorage['timestamp_pets'];
      this.timestamps.recipes = localStorage['timestamp_recipes'];
      this.timestamps.auctions = localStorage['timestamp_auctions'];
      this.timestamps.tsm = localStorage['timestamp_tsm'];
      this.timestamps.wowuction = localStorage['timestamp_wowuction'];
    }, 1000);

    this.init();
  }

  async init(): Promise<void> {
    Dashboard.addLoadingDashboards();

    if (!SharedService.user.region || !SharedService.user.realm) {
      return;
    }

    this.isLoading.next(true);
    const startTimestamp = performance.now();
    console.log('Starting to load data');
    await this.realmService.getRealms()
      .catch(error => console.error(error));

    this.auctionsService.doNotOrganize = true;

    await Promise.all([
      this.loadItems(),
      this.loadPets(),
      this.loadRecipes(),
      this.loadThirdPartyAPI(),
      this.realmService.getStatus(SharedService.user.region, SharedService.user.realm)
    ])
      .catch(console.error);

    await this.startRealmStatusInterval();
    await AuctionUtil.organize(
      this.auctionsService.events.list.value);
    this.auctionsService.doNotOrganize = false;

    await this.dbService.getTSMAddonData();
    this.loggLoadingTime(startTimestamp);
    this.isLoading.next(false);
  }

  private loggLoadingTime(startTimestamp): void {
    const loadingTime = Math.round(
      (performance.now() - startTimestamp)
    );
    console.log(`App startup took ${loadingTime}ms`);
    Report.send('startup', `The startup time was ${loadingTime}ms`);
  }

  private async startRealmStatusInterval() {
    await this.updateRealmStatus();
    setInterval(() =>
      this.updateRealmStatus(), 10000);
  }

  private updateRealmStatus(): Promise<any> {
    if (!this.realmStatus) {
      return;
    }

    this.timeSinceUpdate.next(
      DateUtil.timeSince(this.realmStatus.lastModified, 'm'));

    return new Promise<any>((resolve, reject) => {
      if (this.shouldUpdateRealmStatus()) {
        this.checkingForUpdates = true;
        this.realmService.getStatus(
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
      this.shouldAnUpdateShouldBeAvailableSoon();
  }

  private shouldAnUpdateShouldBeAvailableSoon() {
    return !this.realmStatus ||
      this.realmStatus.lowestDelay - this.timeSinceUpdate.value < 1;
  }

  private async loadItems() {
    await this.dbService.getAllItems()
      .then(async () => {
        if (Object.keys(SharedService.items).length === 0) {
          delete localStorage['timestamp_items'];
        }
      })
      .catch(async error => {
        console.error(error);
      });
    await this.itemService.getItems();
  }

  private async loadPets() {
    await this.dbService.getAllPets()
      .then(async () => {
        if (Object.keys(SharedService.pets).length === 0) {
          delete localStorage['timestamp_pets'];
        }
      })
      .catch(async error => {
      });

    await this.petService.getPets();
  }

  private async loadRecipes() {
    await this.dbService.getAllRecipes()
      .then(async () => {
        if (SharedService.recipes.length === 0) {
          delete localStorage['timestamp_recipes'];
        }
      })
      .catch(async (error) => {
      });

    await this.craftingService.getRecipes();
    await Crafting.checkForMissingRecipes(this.craftingService);
    Crafting.setOnUseCraftsWithNoReagents();
  }

  private async loadThirdPartyAPI() {
    if (SharedService.user.apiToUse === 'tsm') {
      if (new Date().toDateString() !== localStorage['timestamp_tsm']) {
        await this.auctionsService.getTsmAuctions();
      } else {
        await this.dbService.getTSMItems()
          .then(async r => {
            if (Object.keys(SharedService.tsm).length === 0) {
              await this.auctionsService.getTsmAuctions();
            }
          })
          .catch(async e => {
            console.error('Could not restore TSM data', e);
            await this.auctionsService.getTsmAuctions();
          });
      }
    }
  }
}
