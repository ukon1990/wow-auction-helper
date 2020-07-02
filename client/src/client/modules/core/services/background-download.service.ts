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
import {RealmStatus} from '../../../models/realm-status.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Dashboard} from '../../dashboard/models/dashboard.model';
import {AuctionUtil} from '../../auction/utils/auction.util';
import {NpcService} from '../../npc/services/npc.service';
import {ZoneService} from '../../zone/service/zone.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {Timestamps} from '../../../../../../api/src/updates/model';
import {HttpClient} from '@angular/common/http';
import {Endpoints} from '../../../services/endpoints';
import {ProfessionService} from '../../crafting/services/profession.service';
import {TsmService} from '../../tsm/tsm.service';

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
    npc: localStorage.getItem('timestamp_npcs'),
    zone: localStorage.getItem('timestamp_zone')
  };
  private checkingForUpdates: boolean;
  private realmStatus: RealmStatus;
  private subs = new SubscriptionManager();

  constructor(
    private http: HttpClient,
    private realmService: RealmService,
    private itemService: ItemService,
    private craftingService: CraftingService,
    private auctionsService: AuctionsService,
    private petService: PetsService,
    private npcService: NpcService,
    private zoneService: ZoneService,
    private professionService: ProfessionService,
    private tsmService: TsmService,
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

    await this.getUpdateTimestamps()
      .then(async (timestamps: Timestamps) => {
        await Promise.all([
          this.professionService.load(timestamps.professions)
            .catch(console.error),
          this.itemService.loadItems(timestamps.items)
            .catch(console.error),
          this.petService.loadPets(timestamps.pets)
            .catch(console.error),
          this.npcService.getAll(false, timestamps.npcs)
            .catch(console.error),
          this.craftingService.load(timestamps.recipes)
            .catch(console.error),
          this.zoneService.getAll(false, timestamps.zones)
            .then(() =>
              console.log('Done loading zone data'))
            .catch(console.error),
          this.tsmService.load(this.realmService.events.realmStatus.value)
            .catch(console.error),
          this.itemService.getBonusIds(),
        ])
          .catch(console.error);

        await this.realmService.getStatus(region, realm)
          .catch(console.error);
        AuctionUtil.organize(SharedService.auctions)
          .catch(error =>
            ErrorReport.sendError('BackgroundDownloadService.init', error));
        await this.startRealmStatusInterval();
      })
      .catch(error =>
        ErrorReport.sendError('BackgroundDownloadService.init', error));

    await this.dbService.getAddonData();

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

  private getUpdateTimestamps(): Promise<Timestamps> {
    return new Promise<Timestamps>((resolve, rejects) => {
      this.http.get(`${Endpoints.S3_BUCKET}/timestamps.json.gz?rand=${Math.round(Math.random() * 10000)}`)
        .toPromise()
        .then(resolve)
        .catch(rejects);
    });
  }
}
