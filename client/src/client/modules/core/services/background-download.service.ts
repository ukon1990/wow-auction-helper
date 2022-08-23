import {Injectable} from '@angular/core';
import {RealmService} from '../../../services/realm.service';
import {ItemService} from '../../../services/item.service';
import {CraftingService} from '../../../services/crafting.service';
import {AuctionsService} from '../../../services/auctions.service';
import {PetsService} from '../../../services/pets.service';
import {DatabaseService} from '../../../services/database.service';
import {Report} from '../../../utils/report.util';
import {BehaviorSubject} from 'rxjs';
import {SharedService} from '../../../services/shared.service';
import {DateUtil} from '@ukon1990/js-utilities';
import {RealmStatus, Timestamps} from '@shared/models';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {ProfessionService} from '../../crafting/services/profession.service';
import {TsmService} from '../../tsm/tsm.service';
import {LogRocketUtil} from '../../../utils/log-rocket.util';
import {SettingsService} from '../../user/services/settings/settings.service';
import {UserUtil} from '../../../utils/user/user.util';
import {ItemClassService} from '../../item/service/item-class.service';

@Injectable({
  providedIn: 'root'
})
export class BackgroundDownloadService {
  isLoading = new BehaviorSubject(false);
  isInitialLoadCompleted: BehaviorSubject<boolean> = new BehaviorSubject(false);

  timestamps = {
    items: localStorage['timestamp_items'],
    pets: localStorage['timestamp_pets'],
    recipes: localStorage['timestamp_recipes'],
    auctions: localStorage['timestamp_auctions'],
    regionalAuctions: localStorage['timestamp_regionalAuctions'],
    tsm: localStorage['timestamp_tsm'],
    npc: localStorage.getItem('timestamp_npcs'),
    zone: localStorage.getItem('timestamp_zone'),
    professions: localStorage.getItem('timestamp_professions')
  };
  private checkingForUpdates: boolean;
  private realmStatus: RealmStatus;
  private subs = new SubscriptionManager();
  private dbIsReady = false;
  private settingsAreReady = false;

  constructor(
    private http: HttpClient,
    private realmService: RealmService,
    private itemService: ItemService,
    private itemClassService: ItemClassService,
    private craftingService: CraftingService,
    private auctionsService: AuctionsService,
    private petService: PetsService,
    private npcService: NpcService,
    private zoneService: ZoneService,
    private professionService: ProfessionService,
    private tsmService: TsmService,
    private settingsService: SettingsService,
    private dbService: DatabaseService) {

    this.subs.add(
      this.realmService.events.realmStatus,
      (status) =>
        this.realmStatus = status);

    // Dashboard.addLoadingDashboards();
    this.subs.add(this.dbService.databaseIsReady, async (isReady) => {
      this.dbIsReady = isReady;
      await this.initiateIfReady();
    });
    this.subs.add(this.settingsService.hasLoaded, async (hasLoaded) => {
      this.settingsAreReady = hasLoaded;
      await this.initiateIfReady();
    });

    setInterval(() => {
      this.timestamps.items = localStorage['timestamp_items'];
      this.timestamps.pets = localStorage['timestamp_pets'];
      this.timestamps.recipes = localStorage['timestamp_recipes'];
      this.timestamps.auctions = localStorage['timestamp_auctions'];
      this.timestamps.regionalAuctions = localStorage['timestamp_regionalAuctions'];
      this.timestamps.tsm = localStorage['timestamp_tsm'];
      this.timestamps.npc = localStorage.getItem('timestamp_npcs');
      this.timestamps.zone = localStorage.getItem('timestamp_zone');
      this.timestamps.professions = localStorage.getItem('timestamp_professions');
    }, 1000);
  }

  private async initiateIfReady() {
    const useAppSync = localStorage.getItem('useAppSync') ?
      JSON.parse(localStorage.getItem('useAppSync')) : false;

    if (!useAppSync) {
      UserUtil.restore();
    }
    if (this.dbIsReady && (useAppSync && this.settingsAreReady || !useAppSync)) {
      await this.init();
      this.isInitialLoadCompleted.next(true);
    }
  }

  async init(): Promise<void> {
    const {realm, region} = SharedService.user;
    LogRocketUtil.identify();
    const hasRealmAndRegion: boolean = !!(region && realm);

    if (hasRealmAndRegion) {
      this.isLoading.next(true);
      console.log('Starting to load data');
      const startTimestamp = performance.now();
      await this.initiateRealmSpecificDownloads(region, realm);
      if (!ItemService.list.value.length) {
        await this.getGetOrUpdateBasicAppData();
      }
      await this.initiateAuctionOrganizingAndTSM();
      this.loggLoadingTime(startTimestamp);
      this.isLoading.next(false);
    }
  }

  private async initiateAuctionOrganizingAndTSM() {
    this.auctionsService.isReady = true;
    await this.auctionsService.organize()
      .then(() => console.log('Organized'))
      .catch(console.error);
    await this.dbService.getAddonData();
  }

  private async initiateRealmSpecificDownloads(region: string, realm: string) {
    const start = +new Date();


    await this.dbService.getAddonData()
      .catch(console.error);

    try {
      await this.realmService.getRealms();
      await this.realmService.getStatus();
      // After, so that we can get the realm type for the auction service
      await this.realmService.getRegionalStatus();
    } catch (error) {
      ErrorReport.sendError('BackgroundDownloadService.init', error);
    }
    console.log('Loaded realm specific data in ' + DateUtil.getDifferenceInSeconds(start, +new Date()));
  }

  private async getGetOrUpdateBasicAppData() {
    const start = +new Date();
    await this.getUpdateTimestamps()
      .then(async (timestamps: Timestamps) => {
        await this.zoneService.getAll(false, timestamps.zones)
          .then(() =>
            console.log('Done loading zone data'))
          .catch(console.error);
        const recipeTimestamp = this.realmService.isClassic ? timestamps.recipesClassic : timestamps.recipes;
        const itemTimestamp = this.realmService.isClassic ? timestamps.itemsClassic : timestamps.items;

        const promises: Promise<any>[] = [
          this.itemClassService.getAll()
            .catch(console.error),
          this.professionService.load(timestamps.professions),
          this.itemService.loadItems(itemTimestamp,
            this.realmService.isClassic)
            .then(() => console.log('Loaded items in ' + DateUtil.getDifferenceInSeconds(start, +new Date()))),
          this.petService.loadPets(timestamps.pets),
          this.npcService.getAll(false, timestamps.npcs),
          this.craftingService.load(
            recipeTimestamp,
            this.realmService.isClassic),
          this.itemService.getBonusIds(),
        ];

        await Promise.all(promises)
          .then(() => {
            this.npcService.initCalculationAndMapping();
          })
          .catch(console.error);
        console.log('Loaded basic app data in ' + DateUtil.getDifferenceInSeconds(start, +new Date()));
      })
      .catch(error =>
        ErrorReport.sendError('BackgroundDownloadService.init', error));
  }

  private loggLoadingTime(startTimestamp): void {
    const loadingTime = Math.round(
      (performance.now() - startTimestamp)
    );
    console.log(`App startup took ${loadingTime}ms`);
    Report.send(`${(loadingTime / 1000).toFixed(2)}`, 'startup');
  }

  private getUpdateTimestamps(): Promise<Timestamps> {
    return new Promise<Timestamps>((resolve, rejects) => {
      this.http.get(`${Endpoints.S3_BUCKET}/timestamps.json.gz?rand=${Math.round(Math.random() * 10000)}`)
        .toPromise()
        .then((result: Timestamps) => {
          this.itemService.lastModified.next(+new Date(result.items));
          this.npcService.lastModified.next(+new Date(result.npcs));
          this.professionService.lastModified.next(+new Date(result.professions));
          this.petService.lastModified.next(+new Date(result.pets));
          this.craftingService.lastModified.next(+new Date(result.recipes));
          this.craftingService.lastModifiedClassic.next(+new Date(result.recipesClassic));
          this.zoneService.lastModified.next(+new Date(result.zones));
          resolve(result as Timestamps);
        })
        .catch(rejects);
    });
  }
}