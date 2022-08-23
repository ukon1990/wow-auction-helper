import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RealmService} from '../../../../../../services/realm.service';
import {ItemService} from '../../../../../../services/item.service';
import {CraftingService} from '../../../../../../services/crafting.service';
import {AuctionsService} from '../../../../../../services/auctions.service';
import {PetsService} from '../../../../../../services/pets.service';
import {NpcService} from '../../../../../npc/services/npc.service';
import {ZoneService} from '../../../../../zone/service/zone.service';
import {DatabaseService} from '../../../../../../services/database.service';
import {TsmService} from '../../../../../tsm/tsm.service';
import {ProfessionService} from '../../../../../crafting/services/profession.service';
import {BackgroundDownloadService} from '../../../../services/background-download.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionHouseStatus} from '../../../../../auction/models/auction-house-status.model';
import {ErrorReport} from '../../../../../../utils/error-report.util';
import {AuctionUpdateLog, ColumnDescription, Realm, RealmStatus} from '@shared/models';
import {Report} from '../../../../../../utils/report.util';

interface DownloadRow {
  name: string;
  lastModified: number;
  loading?: string;
}

@Component({
  selector: 'wah-download-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DownloadDialogComponent implements OnInit, OnDestroy {
  private sm = new SubscriptionManager();
  status: AuctionHouseStatus;
  log: AuctionUpdateLog;
  regionalLog: AuctionUpdateLog;
  logIsLoading: boolean;
  regionalLogIsLoading: boolean;
  logColumns: ColumnDescription[] = [
    {
      key: 'lastModified',
      title: 'Timestamp',
      dataType: 'date'
    }, {
      key: 'timeSincePreviousDump',
      title: 'Time since previous',
      dataType: 'number'
    }, {
      key: 'size',
      title: 'Compressed file size(MB)',
      dataType: 'number'
    }
  ];
  connectedRealmsColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Name',
      dataType: 'string'
    },
    {
      key: 'timezone',
      title: 'Timezone',
      dataType: 'string'
    },
  ];
  connectedRealms: Realm[] = [];
  downloadRows: DownloadRow[] = [];
  downloadColumns: ColumnDescription[] = [
    {
      key: 'name',
      title: 'Dataset',
      dataType: 'text',
    }, {
      key: 'lastModified',
      title: 'Last modified',
      dataType: 'date',
    }, {
      key: 'loading',
      title: '',
      dataType: 'text',
    }, {
      key: '',
      title: '',
      dataType: 'row-actions',
      actions: [{
        icon: 'fa fa-download',
        tooltip: 'Download',
        callback: row => this.download(row)
      }]
    }
  ];
  private timestamps;
  private isDownloading: string;

  constructor(
    private realmService: RealmService,
    private itemService: ItemService,
    private craftingService: CraftingService,
    private auctionsService: AuctionsService,
    private petService: PetsService,
    private npcService: NpcService,
    private zoneService: ZoneService,
    private dbService: DatabaseService,
    private tsmService: TsmService,
    private professionService: ProfessionService,
    private service: BackgroundDownloadService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DownloadDialogComponent>) {
    this.timestamps = service.timestamps;

    this.sm.add(realmService.events.realmStatus, (status: AuctionHouseStatus) => {
      this.status = status;
      this.setConnectedRealms();
      this.logIsLoading = true;
      this.realmService.getLogForRealmWithId(status.id)
        .then(log => {
          this.log = log;
          this.logIsLoading = false;
        })
        .catch(error => {
          ErrorReport.sendHttpError(error);
          this.logIsLoading = false;
        });
    });
    this.sm.add(realmService.events.regionalStatus, (status: AuctionHouseStatus) => {
      this.regionalLogIsLoading = false;
      this.realmService.getLogForRealmWithId(status.id)
        .then(log => {
          this.regionalLog = log;
          this.regionalLogIsLoading = false;
        })
        .catch(error => {
          ErrorReport.sendHttpError(error);
          this.regionalLogIsLoading = false;
        });
    });
    this.sm.add(realmService.events.map, map => {
      if (!status) {
        return;
      }
      this.setConnectedRealms(map);
    });
  }

  private setConnectedRealms(map: Map<number, RealmStatus> = this.realmService.events.map.value) {
    const fullRealmStatus = map.get(this.status.id);
    if (fullRealmStatus) {
      this.connectedRealms = fullRealmStatus.realms;
    }
  }

  ngOnInit(): void {
    this.setDownloadRows();
  }

  private setDownloadRows(isDownloading: string = this.isDownloading) {
    this.setTimestamps();
    console.log('stuff', this.timestamps);
    this.downloadRows = [
      {name: 'Realm auctions', lastModified: this.timestamps.auctions},
      {name: 'Region auctions', lastModified: this.timestamps.regionalAuctions},
      {name: 'TSM', lastModified: this.timestamps.tsm},
      {name: 'Items', lastModified: this.timestamps.items},
      {name: 'Pets', lastModified: this.timestamps.pets},
      {name: 'Recipes', lastModified: this.timestamps.recipes},
      {name: 'NPCs', lastModified: this.timestamps.npc},
      {name: 'Zones', lastModified: this.timestamps.zone},
      {name: 'Professions', lastModified: this.timestamps.professions}
    ].map((row: DownloadRow) => {
      if (row.name.toLowerCase() === isDownloading) {
        row.loading = 'Loading…';
      } else {
        row.loading = '';
      }
      return row;
    });
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  setTimestamps(): void {
    this.timestamps = {
      items: this.getValue('timestamp_items'),
      pets: this.getValue('timestamp_pets'),
      recipes: this.getValue('timestamp_recipes'),
      auctions: this.getValue('timestamp_auctions'),
      regionalAuctions: this.getValue('timestamp_regionalAuctions'),
      tsm: this.getValue('timestamp_tsm'),
      npc: this.getValue('timestamp_npcs'),
      zone: this.getValue('timestamp_zone'),
      professions: this.getValue('timestamp_professions')
    };
  }

  getValue(key: string): any {
    const val = localStorage.getItem(key);
    if (!val || val === 'undefined') {
      return undefined;
    }
    return val;
  }

  /* istanbul ignore next */
  async download({name}: { name: string }) {
    const type = name.toLowerCase();
    this.isDownloading = type;
    this.setDownloadRows();

    Report.send(type, 'Manual download');
    switch (type) {
      case 'tsm':
        await this.downloadTSM()
          .catch(console.error);
        break;
      case 'auctions':
        await this.downloadAuctions(false)
          .catch(console.error);
        break;
      case 'region auctions':
        await this.downloadAuctions(true)
          .catch(console.error);
        break;
      case 'items':
        await this.downloadItems(true)
          .catch(console.error);
        break;
      case 'pets':
        await this.downloadPets(true)
          .catch(console.error);
        break;
      case 'recipes':
        await this.downloadRecipes(true)
          .catch(console.error);
        break;
      case 'npcs':
        await this.npcService.getAll(true)
          .catch(console.error);
        break;
      case 'zones':
        await this.zoneService.get()
          .catch(console.error);
        break;
      case 'professions':
        await this.professionService.getAll()
          .catch(console.error);
        break;
    }
    this.isDownloading = undefined;
    this.setDownloadRows();
  }

  private async downloadAuctions(isRegional?: boolean) {
    if (isRegional) {
      await this.realmService.getRegionalStatus();
      await this.auctionsService.getRegionalAuctions();
    } else {
      await this.realmService.getStatus();
      await this.auctionsService.getAuctions();
    }
  }

  private async downloadTSM() {
    await this.tsmService.get(this.realmService.events.realmStatus.value)
      .catch(console.error);
    await this.auctionsService.organize();
  }

  private async downloadPets(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_pets'];
    }

    await this.petService.getPets();

    if (forceUpdate) {
      await this.auctionsService.organize();
    }
  }

  private async downloadRecipes(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_recipes'];
    }
    await this.craftingService.get(this.realmService.isClassic);

    if (forceUpdate) {
      await this.auctionsService.organize();
    }
  }

  private async downloadItems(forceUpdate: boolean) {
    if (forceUpdate) {
      delete localStorage['timestamp_items'];
    }

    await this.itemService.getItems(this.realmService.isClassic);

    if (forceUpdate) {
      await this.auctionsService.organize();
    }
  }
}