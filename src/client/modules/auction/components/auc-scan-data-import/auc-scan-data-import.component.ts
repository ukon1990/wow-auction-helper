import {Component, OnInit} from '@angular/core';
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
import {TSM} from '../../models/tsm.model';
import {AuctionItem} from '../../models/auction-item.model';
import {TextUtil} from '@ukon1990/js-utilities';

@Component({
  selector: 'wah-auc-scan-data-import',
  templateUrl: './auc-scan-data-import.component.html',
  styleUrls: ['./auc-scan-data-import.component.scss']
})
export class AucScanDataImportComponent implements OnInit {
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

  constructor(
    private auctionsService: AuctionsService,
    private dbService: DatabaseService,
    private realmService: RealmService,
    private petService: PetsService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      realm: null,
      isClassicMode: false
    });

    this.reader.onload = async e => {
      try {
        console.log(e, this.reader);
        const result = this.reader.result;
        Report.debug(
          LuaUtil.toObject(result)
        ); /*
        this.lastModified =
          fileEvent['srcElement']['files'][0].lastModifiedDate;*/
        Report.send('Imported TSM addon data', 'Import');
      } catch (error) {
        ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
      }
    };
  }

  ngOnInit() {
    const realm = localStorage.getItem('realmClassic');

    if (SharedService.user.isClassicMode) {
      this.dbService
        .getClassicAuctions(this.petService, this.auctionsService)
        .then(d => console.log('Classic auctions loaded', d));
    }

    this.sm.add(this.form.controls.realm.valueChanges, realmClassic =>
      this.onRealmChange(realmClassic)
    );

    this.sm.add(this.form.controls.isClassicMode.valueChanges, is => {
      SharedService.user.isClassicMode = is;
      User.save();
    });

    if (realm) {
      this.form.controls.realm.setValue(realm);
      const auctions = this.getCurrentRealmAuctions(realm);
      if (auctions) {
        this.dbService.addClassicAuctions(auctions);
      }
    }

    this.form.controls.isClassicMode.setValue(SharedService.user.isClassicMode);
  }

  private getCurrentRealmAuctions(realm) {
    return this.result.filter(r => r.realm === realm)[0];
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      const reader = new FileReader();
      reader.onload = async e => {
        this.handleFileEvent(reader, files[0], fileEvent);
      };
      reader.readAsText(files[0]);
    } catch (error) {
      ErrorReport.sendError('TsmAddonDbComponent.importFromFile', error);
    }
  }

  private handleFileEvent(reader: FileReader, file: File, fileEvent) {
    Report.debug('handleFileEvent', file);
    try {
      const result = reader.result;
      switch (file.name) {
        case this.ADDONS.AHDB:
          this.handleAHDBFile(result);
          break;
        case this.ADDONS.Auctioneer:
          this.handleAuctioneerFile(result);
          break;
        case this.ADDONS.TSM:
          this.handleTSMFile(result);
          break;
        default:
          Report.debug('Unsupported file', file.name, LuaUtil.toObject(result));
          break;
      }

      this.lastModified = file.lastModified;
      Report.send('Imported TSM addon data', 'Import');
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
    localStorage.setItem('realmClassic', realm);
    this.getCurrentRealmAuctions(realm);
  }

  async loadData() {
    const realm = this.getCurrentRealmAuctions(this.form.value.realm);
    if (realm) {
      this.auctionsService.events.list.next(realm.auctions);
      this.dbService.addClassicAuctions(realm.auctions);
      await AuctionUtil.organize(realm.auctions, this.petService);
      const status = new AuctionHouseStatus();
      status.lastModified = realm.lastScan;
      this.realmService.events.realmStatus.next(status);
    }
  }
}
