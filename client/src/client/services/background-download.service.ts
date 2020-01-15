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
import {Auction} from '../modules/auction/models/auction.model';
import {ItemExtract} from '../utils/item-extract.util';
import {NpcService} from '../modules/npc/services/npc.service';
import {ZoneService} from '../modules/zone/service/zone.service';
import {ErrorReport} from '../utils/error-report.util';

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
    wowuction: localStorage['timestamp_wowuction'],
    npc: localStorage.getItem('timestamp_npcs'),
    zone: localStorage.getItem('timestamp_zone')
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
    private npcService: NpcService,
    private zoneService: ZoneService,
    private dbService: DatabaseService) {


    this.subs.add(
      this.realmService.events.realmStatus,
      (status) =>
        this.realmStatus = status);

    Dashboard.addLoadingDashboards();
    this.subs.add(this.dbService.databaseIsReady, async (isReady) => {
      if (isReady) {
        await this.init();
      }
    });

    setInterval(() => {
      this.timestamps.items = localStorage['timestamp_items'];
      this.timestamps.pets = localStorage['timestamp_pets'];
      this.timestamps.recipes = localStorage['timestamp_recipes'];
      this.timestamps.auctions = localStorage['timestamp_auctions'];
      this.timestamps.tsm = localStorage['timestamp_tsm'];
      this.timestamps.wowuction = localStorage['timestamp_wowuction'];
      this.timestamps.npc = localStorage.getItem('timestamp_npcs');
      this.timestamps.zone = localStorage.getItem('timestamp_zone');
    }, 1000);
  }

  async init(): Promise<void> {
    const {realm, region} = SharedService.user;

    if (!region || !realm) {
      return;
    }

    this.isLoading.next(true);
    const startTimestamp = performance.now();
    console.log('Starting to load data');
    await this.realmService.getRealms()
      .catch(error => console.error(error));
    await this.realmService.getStatus(region, realm)
      .catch(console.error);

    this.auctionsService.doNotOrganize = true;

    await Promise.all([
      this.loadItems().catch(console.error),
      this.loadPets().catch(console.error),
      this.loadNpc().catch(console.error),
      this.loadRecipes().catch(console.error),
      this.loadZones().catch(console.error),
      this.loadThirdPartyAPI().catch(console.error)
    ])
      .catch(console.error);

    await this.startRealmStatusInterval();
    const auctions: Auction[] = this.auctionsService.events.list.value;
    await AuctionUtil.organize(auctions);
    this.auctionsService.reTriggerEvents();
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
    Report.send(`${(loadingTime / 1000).toFixed(2)}`, 'startup');
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
        delete localStorage['timestamp_items'];
        console.error(error);
      });
    await this.itemService.getItems();
    console.log('Processed items mapped', ItemExtract.fromItems(SharedService.itemsUnmapped));
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

  private async loadNpc() {
    await this.npcService.getAll()
      .then(() => console.log('Done loading NPC data'))
      .catch(console.error);
    console.log('loadNpc');
  }

  private async loadZones() {
    await this.zoneService.getAll()
      .then(() => console.log('Done loading zone data'))
      .catch(console.error);
  }
}
