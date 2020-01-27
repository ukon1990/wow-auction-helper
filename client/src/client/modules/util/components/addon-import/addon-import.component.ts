import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {DatabaseService} from '../../../../services/database.service';
import {RealmService} from '../../../../services/realm.service';
import {PetsService} from '../../../../services/pets.service';
import {SharedService} from '../../../../services/shared.service';
import {User} from '../../../../models/user/user';
import {Report} from '../../../../utils/report.util';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {TextUtil} from '@ukon1990/js-utilities';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {RealmStatus} from '../../../../models/realm-status.model';
import {AucScanDataImportUtil} from '../../../auction/utils/auc-scan-data-import.util';
import {LuaUtil} from '../../../auction/utils/lua.util';
import {AuctionDBImportUtil} from '../../../auction/utils/auction-db-import.util';
import {AuctionUtil} from '../../../auction/utils/auction.util';
import {AuctionHouseStatus} from '../../../auction/models/auction-house-status.model';
import {GameBuild} from '../../../../utils/game-build.util';

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
  gameVersions = GameBuild.versions;
  form: FormGroup;
  sm = new SubscriptionManager();
  reader = new FileReader();

  readonly ADDONS = {
    TSM: GameBuild.ADDONS.TSM,
    // Auctioneer: GameBuild.ADDONS.Auctioneer
  };
  readonly ADDON_LIST: string = Object.keys(this.ADDONS).map(k => `${k} (${this.ADDONS[k].file})`).join(', ');

  readonly AUCTION_DATA_SOURCES = [
    // TODO: this.ADDONS.AHDB, this.ADDONS.Auctioneer
  ];
  addonPathText = 'World of Warcraft/_retail/WTF/Account/"account name"/SavedVariables/';

  constructor(
    private auctionsService: AuctionsService,
    private dbService: DatabaseService,
    private realmService: RealmService,
    private petService: PetsService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      realm: SharedService.user.realm,
      auctionDataSource: -1,
      gameVersion: SharedService.user.gameVersion
    });
  }

  ngOnInit() {
    const realm = localStorage.getItem('realmClassic');
    this.lastModified = +localStorage.getItem('timestamp_addons');

    /*
    if (SharedService.user.gameVersion) {
      this.dbService
        .getClassicAuctions(this.form.value.realm, this.petService, this.auctionsService)
        .then(d => console.log('Classic auctions loaded', d));
    }*/

    this.sm.add(this.form.controls.realm.valueChanges, realmClassic =>
      this.onRealmChange(realmClassic)
    );

    this.sm.add(this.form.controls.gameVersion.valueChanges, version => {
      SharedService.user.gameVersion = version;
      User.save();
    });


    if (realm) {
      this.form.controls.realm.setValue(realm);
      const realmData = this.getCurrentRealmAuctions(realm);
      if (realmData) {
        this.dbService.addClassicAuctions(realmData);
      }
    }

    this.sm.add(TsmLuaUtil.events, tsm =>
      this.setTSMMarketValueIfAvailable(this.form.value.gameVersion, tsm));
  }

  private getCurrentRealmAuctions(realm) {
    return this.result.filter(r => r.realm === realm)[0];
  }

  importFromFile(fileEvent): void {
    try {
      const files = fileEvent.target.files;
      console.log('Files', {files, fileEvent}, Object.keys(files));
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
      ErrorReport.sendError('AddonComponent.importFromFile', error);
    }
  }

  private handleFileEvent(reader: FileReader, {name, lastModified, webkitRelativePath}: any, fileEvent) {
    try {
      if (webkitRelativePath) {
        name = webkitRelativePath.replace('SavedVariables/', '');
      }
      const result = reader.result;
      const {
          auctionDataSource,
          gameVersion,
        } = this.form.value,
        selectedSourceFile = this.AUCTION_DATA_SOURCES[auctionDataSource];
      /* TODO: Activate for classic
      let sourceFile;
      if (selectedSourceFile) {
        sourceFile = selectedSourceFile.file;
      }
      const isSourceMatch = sourceFile === name;
      if (name === this.ADDONS.AHDB.file && isSourceMatch) {
        this.handleAHDBFile(result, +new Date(lastModified));
      } else if (name === this.ADDONS.Auctioneer.file && isSourceMatch) {
        this.handleAuctioneerFile(result, +new Date(lastModified));
      } else*/
      /*
      if (name === this.ADDONS.TSM.file) {
        this.handleTSMFile(result, gameVersion, +new Date(lastModified));
      } else {
        Report.debug('File data', name, LuaUtil.toObject(result));
      }*/

      switch (name) {
        case this.ADDONS.TSM.file:
          this.handleTSMFile(result, gameVersion, +new Date(lastModified));
          break;
          /*
        case this.ADDONS.Auctioneer:
          AuctioneerStatsOverTimeUtil.import(result);
          break;*/
        default:
          Report.debug('File data', name, LuaUtil.toObject(result));
          break;
      }

      this.lastModified = +new Date();
    } catch (error) {
      ErrorReport.sendError('AddonComponent.importFromFile', error);
    }
  }

  private handleAHDBFile(result, lastModified: number) {
    const auctionDB = AuctionDBImportUtil.import(result);
    this.dbService.addAddonData(GameBuild.ADDONS.AHDB.file, result, this.form.value.gameVersion, lastModified);
  }

  private handleAuctioneerFile(result, lastModified) {
    this.result = AucScanDataImportUtil.import(result);
    this.dbService.addAddonData(GameBuild.ADDONS.Auctioneer.file, result, this.form.value.gameVersion, lastModified);
    if (this.form.value.realm) {
      this.loadData();
    }
    const realms: RealmStatus[] = [];
    this.result.forEach(r =>
      realms.push(new RealmStatus(r.realm, +r.lastScan)));
    localStorage.setItem('classicRealms', JSON.stringify(realms));
    this.realmService.events.list.next(realms);
  }

  private handleTSMFile(result, gameVersion: number, lastModified: number) {
    this.dbService.addAddonData(this.ADDONS.TSM.file, result, gameVersion, lastModified);
    this.setTSMMarketValueIfAvailable(gameVersion, new TsmLuaUtil().convertList(result));
  }

  private setTSMMarketValueIfAvailable(gameVersion: number, csv: TSMCSV) {
    if (!csv) {
      return;
    }
    const {auctionDBScanTime, csvAuctionDBScan} = csv;
    let lastScanTimestamp;
    let added = 0;
    const realms = Object.keys(csvAuctionDBScan).filter(r =>
      TextUtil.contains(r, this.form.value.realm));
    if (gameVersion && realms.length) {
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
      Report.debug('TSM import', csvAuctionDBScan);
      console.log('TSM market values last updated ', lastScanTimestamp, this.form.value.realm, added);
    }
  }

  private async onRealmChange(realm: string) {
    SharedService.user.classicRealm = realm;
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
