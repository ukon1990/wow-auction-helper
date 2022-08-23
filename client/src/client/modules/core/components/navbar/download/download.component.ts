import {Component} from '@angular/core';
import {SharedService} from '../../../../../services/shared.service';
import {ItemService} from '../../../../../services/item.service';
import {CraftingService} from '../../../../../services/crafting.service';
import {AuctionsService} from '../../../../../services/auctions.service';
import {PetsService} from '../../../../../services/pets.service';
import {DatabaseService} from '../../../../../services/database.service';
import {RealmService} from '../../../../../services/realm.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {RealmStatus} from '@shared/models';
import {BackgroundDownloadService} from '../../../services/background-download.service';
import {ThemeUtil} from '../../../utils/theme.util';
import {NpcService} from '../../../../npc/services/npc.service';
import {ZoneService} from '../../../../zone/service/zone.service';
import {faDownload, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {TsmService} from '../../../../tsm/tsm.service';
import {ProfessionService} from '../../../../crafting/services/profession.service';
import {MatDialog} from '@angular/material/dialog';
import {DownloadDialogComponent} from './dialog/dialog.component';

@Component({
  selector: 'wah-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent {
  theme = ThemeUtil.current;
  timeSinceUpdate = 0;
  timeSinceRegionalUpdate = 0;
  downloadProgress = '';
  subs = new SubscriptionManager();
  faExclamationCircle = faExclamationCircle;
  faDownload = faDownload;

  private realmStatus: RealmStatus;
  private regionalStatus: RealmStatus;

  constructor(
    public dialog: MatDialog,
    private _realmService: RealmService,
    private _itemService: ItemService,
    private _craftingService: CraftingService,
    private _auctionsService: AuctionsService,
    private _petService: PetsService,
    private npcService: NpcService,
    private zoneService: ZoneService,
    private _dbService: DatabaseService,
    private tsmService: TsmService,
    private professionService: ProfessionService,
    private service: BackgroundDownloadService) {

    this.subs.add(
      this._realmService.events.realmStatus,
      (status) => this.realmStatus = status);

    this.subs.add(
      this._realmService.events.regionalStatus,
      (status) => this.regionalStatus = status);

    this.subs.add(
      this._realmService.events.timeSince,
      time =>
        this.timeSinceUpdate = time);

    this.subs.add(
      this._realmService.events.timeSinceRegional,
      time =>
        this.timeSinceRegionalUpdate = time);
  }

  toggle(): void {
    this.dialog.open(DownloadDialogComponent, {
      width: '95%',
      maxWidth: '100%'
    });
  }

  private setRealmStatus(status: RealmStatus) {
    this.realmStatus = status;
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
    return this.service.isLoading.value || SharedService.isDownloading() || this._realmService.isCheckingStatus;
  }
}