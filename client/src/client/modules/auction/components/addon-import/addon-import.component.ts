import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {User} from '../../../../models/user/user';
import {AuctionsService} from '../../../../services/auctions.service';
import {DatabaseService} from '../../../../services/database.service';
import {PetsService} from '../../../../services/pets.service';
import {RealmService} from '../../../../services/realm.service';
import {SharedService} from '../../../../services/shared.service';
import {ErrorReport} from '../../../../utils/error-report.util';
import {LuaUtil} from '../../../../utils/lua.util';
import {Report} from '../../../../utils/report.util';
import {AuctionHouseStatus} from '../../models/auction-house-status.model';
import {AucScanDataImportUtil} from '../../utils/auc-scan-data-import.util';
import {AuctionUtil} from '../../utils/auction.util';
import {AuctionDBImportUtil} from '../../utils/auction-db-import.util';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {AuctionItem} from '../../models/auction-item.model';
import {TextUtil} from '@ukon1990/js-utilities';
import {RealmStatus} from '../../../../models/realm-status.model';

@Component({
  selector: 'wah-addon-import',
  templateUrl: './addon-import.component.html',
  styleUrls: ['./addon-import.component.scss']
})
export class AddonImportComponent implements OnInit {
  @Input() minimal: boolean;
  // Classic AH timer is 2, 8, 24
  lastModified: number;
  result = [];
  realmControl = new FormControl();
  form: FormGroup;
  sm = new SubscriptionManager();
  reader = new FileReader();

  readonly ADDONS = {
    AHDB: 'AuctionDB.lua',
    Auctioneer: 'Auc-ScanData.lua',
    TSM: 'TradeSkillMaster.lua'
  };

  readonly AUCTION_DATA_SOURCES = [
    {name: 'AHDB', fileName: this.ADDONS.AHDB},
    {name: 'Auctioneer', fileName: this.ADDONS.Auctioneer}
  ];

  constructor(
    private auctionsService: AuctionsService,
    private dbService: DatabaseService,
    private realmService: RealmService,
    private petService: PetsService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      realm: SharedService.user.realm,
      auctionDataSource: 1
    });
  }

  ngOnInit() {
    const realm = localStorage.getItem('realmClassic');

    if (SharedService.user.gameVersion) {
      this.dbService
        .getClassicAuctions(this.form.value.realm, this.petService, this.auctionsService)
        .then(d => console.log('Classic auctions loaded', d));
    }

    this.sm.add(this.form.controls.realm.valueChanges, realmClassic =>
      this.onRealmChange(realmClassic)
    );

    if (realm) {
      this.form.controls.realm.setValue(realm);
      const realmData = this.getCurrentRealmAuctions(realm);
      if (realmData) {
        this.dbService.addClassicAuctions(realmData);
      }
    }
  }

  private getCurrentRealmAuctions(realm) {
    return this.result.filter(r => r.realm === realm)[0];
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      console.log('Files', files, Object.keys(files));
      Object.keys(files)
        .forEach(i => {
          const reader = new FileReader();
          reader.onload = async e => {
            this.handleFileEvent(reader, files[i], fileEvent);
          };
          reader.readAsText(files[i]);
        });
      this.loadData();
    } catch (error) {
      ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
    }
  }

  private handleFileEvent(reader: FileReader, {name, lastModified, webkitRelativePath}: any, fileEvent) {
    try {
      if (webkitRelativePath) {
        name = webkitRelativePath.replace('SavedVariables/', '');
      }
      const result = reader.result;
      const {auctionDataSource} = this.form.value;
      const sourceFile = this.AUCTION_DATA_SOURCES[auctionDataSource].fileName;
      const isSourceMatch = sourceFile === name;

      if (name === this.ADDONS.AHDB && isSourceMatch) {
        this.handleAHDBFile(result);
      } else if (name === this.ADDONS.Auctioneer && isSourceMatch) {
        this.handleAuctioneerFile(result);
      } else if (name === this.ADDONS.TSM) {
        this.handleTSMFile(result);
      } else {
        Report.debug('File data', name,  LuaUtil.toObject(result));
      }

      this.lastModified = lastModified;
      // Report.send('Imported TSM addon data', 'Import');
    } catch (error) {
      ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
    }
  }

  private handleAHDBFile(result) {
    Report.debug('AHDB file');
    AuctionDBImportUtil.import(result);
  }

  private handleAuctioneerFile(result) {
    this.result = AucScanDataImportUtil.import(result);
    if (this.form.value.realm) {
      this.loadData();
    }
    const realms: RealmStatus[] = [];
    this.result.forEach(r =>
      realms.push(new RealmStatus(r.realm, +r.lastScan)));
    localStorage.setItem('classicRealms', JSON.stringify(realms));
    this.realmService.events.list.next(realms);
  }

  private handleTSMFile(result) {
    const {auctionDBScanTime, csvAuctionDBScan}: TSMCSV = new TsmLuaUtil().convertList(result);
    let lastScanTimestamp;
    let added = 0;
    const realms = Object.keys(csvAuctionDBScan).filter(r =>
      TextUtil.contains(r, this.form.value.realm));
    if (realms.length) {
      const realm = realms[0];
      if (csvAuctionDBScan && csvAuctionDBScan[realm]) {
        const tsmData = csvAuctionDBScan[realm];
        tsmData.forEach(({id, marketValue, lastScan}) => {
          if (SharedService.auctionItemsMap[id]) {
            (SharedService.auctionItemsMap[id] as AuctionItem).mktPrice = marketValue;
            added++;
          }
        });
      }
      lastScanTimestamp = auctionDBScanTime[realm] * 1000;
    }
    Report.debug('TSM import', csvAuctionDBScan);
    console.log('TSM market values last updated ', lastScanTimestamp, this.form.value.realm, added);
  }

  private async onRealmChange(realm: string) {
    SharedService.user.realm = realm;
    this.getCurrentRealmAuctions(realm);
    User.save();
    this.loadData();
  }

  async loadData() {
    const realm = this.getCurrentRealmAuctions(this.form.value.realm);
    if (realm) {
      this.auctionsService.events.list.next(realm.auctions);
      this.dbService.addClassicAuctions(realm);
      await AuctionUtil.organize(realm.auctions, this.petService);
      const status = new AuctionHouseStatus();
      status.lastModified = realm.lastScan;
      this.realmService.events.realmStatus.next(status);
    }
  }
}
