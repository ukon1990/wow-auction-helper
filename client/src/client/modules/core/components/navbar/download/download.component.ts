import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
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
import {Realm} from '../../../../../models/realm';
import {AuctionUtil} from '../../../../auction/utils/auction.util';
import {BackgroundDownloadService} from '../../../services/background-download.service';
import {ThemeUtil} from '../../../utils/theme.util';
import {NpcService} from '../../../../npc/services/npc.service';
import {ZoneService} from '../../../../zone/service/zone.service';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
  theme = ThemeUtil.current;
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
    wowuction: localStorage['timestamp_wowuction'],
    npc: localStorage.getItem('timestamp_npcs'),
    zone: localStorage.getItem('timestamp_zone')
  };
  private realmStatus: RealmStatus;

  constructor(
    private _realmService: RealmService,
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private npcService: NpcService,
    private zoneService: ZoneService,
    private _dbService: DatabaseService,
    private service: BackgroundDownloadService) {

    this.timestamps = service.timestamps;

    this.subs.add(
      this._realmService.events.realmStatus,
      (status) => this.setRealmStatus(status));

    this.subs.add(
      this.service.timeSinceUpdate,
      time =>
        this.timeSinceUpdate = time);
  }

  private setRealmStatus(status: RealmStatus) {
    this.realmStatus = status;
  }

  async ngOnInit() {
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
      case 'npc':
        this.npcService.getAll(true)
          .catch(console.error);
        break;
      case 'zone':
        this.zoneService.getAll(true)
          .catch(console.error);
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

  private isOnline(): boolean {
    return navigator.onLine;
  }

  private async downloadAuctions() {
    this.downloadProgress = 'Downloading new auctions';
    await this._realmService.getStatus(SharedService.user.region, SharedService.user.realm);
    await this._auctionsService.getAuctions();
  }

  private async downloadTSM() {
    this.downloadProgress = 'Downloading TSM data';
    await this._auctionsService.getTsmAuctions();
    AuctionUtil.organize(SharedService.auctions);
  }

  private async downloadPets(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_pets'];
    }

    this.downloadProgress = 'Downloading pets';
    await this._petService.getPets();

    if (forceUpdate) {
      AuctionUtil.organize(SharedService.auctions);
    }
  }

  private async downloadRecipes(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_recipes'];
    }
    this.downloadProgress = 'Downloading recipes';
    await this._craftingService.getRecipes();

    if (forceUpdate) {
      AuctionUtil.organize(SharedService.auctions);
    }
  }

  private async downloadItems(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_items'];
    }

    this.downloadProgress = 'Downloading items';
    await this._itemService.getItems();

    if (forceUpdate) {
      AuctionUtil.organize(SharedService.auctions);
    }
  }
}
