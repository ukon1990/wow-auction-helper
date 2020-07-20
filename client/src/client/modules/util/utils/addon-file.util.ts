import {DatabaseService} from '../../../services/database.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {Report} from '../../../utils/report.util';
import {TSMCSV, TsmLuaUtil} from '../../../utils/tsm/tsm-lua.util';
import {TextUtil} from '@ukon1990/js-utilities';
import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {AuctionDBImportUtil} from '../../auction/utils/auction-db-import.util';
import {AuctionsService} from '../../../services/auctions.service';

class FileResponse {
  lastModified: number;
  data: any | any[];
  fileName: string;
}

class AddonResponse {
  AHDB: FileResponse;
  Auctioneer: FileResponse;
  TSM: FileResponse;
}

export class AddonFileUtil {
  public readonly ADDONS = {
    AHDB: 'AuctionDB.lua',
    Auctioneer: 'Auc-ScanData.lua',
    TSM: 'TradeSkillMaster.lua'
  };
  public readonly AUCTION_DATA_SOURCES = [
    {name: 'AHDB', fileName: this.ADDONS.AHDB},
    {name: 'Auctioneer', fileName: this.ADDONS.Auctioneer}
  ];
  private auctionDataSource: number;
  private realm: string;

  constructor(private service: DatabaseService, private auctionService: AuctionsService) {

  }

  setDataSource(index: number): void {
    this.auctionDataSource = index;
  }

  setRealm(realm): void {
    this.realm = realm;
  }


  import(fileEvent): void {
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
    } catch (error) {
      ErrorReport.sendError('AddonFileUtil.import', error);
    }
  }

  private handleFileEvent(reader: FileReader, {name, lastModified, webkitRelativePath}: any, fileEvent) {
    try {
      if (webkitRelativePath) {
        name = webkitRelativePath.replace('SavedVariables/', '');
      }
      const result = reader.result;

      const sourceFile = this.AUCTION_DATA_SOURCES[this.auctionDataSource].fileName;
      const isSourceMatch = sourceFile === name;

      if (name === this.ADDONS.AHDB && isSourceMatch) {
        this.handleAHDBFile(result);
      } else if (name === this.ADDONS.Auctioneer && isSourceMatch) {
        this.handleAuctioneerFile(result);
      } else if (name === this.ADDONS.Auctioneer && isSourceMatch) {
        this.handleTSMFile(result);
      }

      // TODO: this.lastModified = lastModified;
      Report.send('Imported TSM addon data', 'Import');
    } catch (error) {
      ErrorReport.sendError('AddonComponent.importFromFile', error);
    }
  }

  private handleAHDBFile(result) {
    Report.debug('AHDB file');
    AuctionDBImportUtil.import(result);
  }

  private handleAuctioneerFile(result) {/*
    this.result = AucScanDataImportUtil.import(result);
    if (this.form.value.realm) {
      this.loadData();
    }*/
  }

  private handleTSMFile(result) {
    const {auctionDBScanTime, csvAuctionDBScan}: TSMCSV = new TsmLuaUtil(this.auctionService).convertList(result);
    let lastScanTimestamp;
    let added = 0;
    const realms = Object.keys(csvAuctionDBScan).filter(r =>
      TextUtil.contains(r, this.realm));
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
    console.log('TSM market values last updated ', lastScanTimestamp, this.realm, added);
  }
}
