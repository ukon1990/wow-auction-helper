import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Item } from '../models/item/item';
import { Auction } from '../models/auction/auction';
import { AuctionHandler } from '../models/auction/auction-handler';
import { SharedService } from './shared.service';
import { TSM } from '../models/auction/tsm';
/**
 * A Class for handeling the indexedDB
 */
@Injectable()
export class DatabaseService {
  private db: Dexie;

  readonly TSM_TABLE_COLUMNS = 'Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,'
    + 'RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,'
    + 'RegionAvgDailySold,RegionSaleRate';
  readonly WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm';
  readonly ITEM_TABLE_COLUMNS = 'id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells'
    + ',itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation';
  readonly PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source';
  readonly AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';

  constructor() {
    this.db = new Dexie('wah-db');
    this.setDbVersions();
    this.db.open()
      .then(() => {
        console.log('wah-db successfully started');
      }).catch(error => {
        console.log('Unable to start indexedDB', error);
      });
  }

  addItem(item: Item): void {
    // logic inc
  }

  addItems(items: Array<Item>): void {
    this.db.table('items').clear();
    this.db.table('items').bulkPut(items);
  }

  getAllItems(): void {
    this.db.table('items')
      .toArray()
      .then(items =>
        items.forEach(i => {
          SharedService.items[i.id] = i;
        })
      ).catch(e =>
        console.error('Could not restore items from local DB', e));
  }

  addAuction(auction: Auction): void {
    // logic inc
  }

  addAuctions(auctions: Array<Auction>): void {
    this.db.table('auctions').clear();
    this.db.table('auctions')
      .bulkPut(auctions)
      .then(r => console.log('Successfully added auctions to local DB'))
      .catch(e => console.error('Could not add auctions to local DB', e));
  }

  getAllAuctions(): Dexie.Promise<any> {
    SharedService.downloading.auctions = true;
    return this.db.table('auctions')
      .toArray()
      .then(auctions => {
        SharedService.downloading.auctions = false;
        AuctionHandler.organize(auctions);
        console.log('Restored auction from local DB');
      }).catch(e => {
        console.error('Could not restore auctions from local DB', e);
        SharedService.downloading.auctions = false;
      });
  }

  addTSMItems(tsm: Array<TSM>): void {
    this.db.table('tsm').clear();
    this.db.table('tsm')
      .bulkPut(tsm)
      .then(r => console.log('Successfully added tsm data to local DB'))
      .catch(e => console.error('Could not add tsm data to local DB', e));
  }

  getTSMItems(): Dexie.Promise<any> {
    SharedService.downloading.tsmAuctions = true;
    return this.db.table('tsm')
      .toArray()
      .then(tsm => {
        (<TSM[]>tsm).forEach(a => {
          SharedService.tsm[a.Id] = a;
        });
        SharedService.downloading.tsmAuctions = false;
        console.log('Restored TSM data from local DB');
      })
      .catch(e => {
        console.error('Could not restore TSM data', e);
        SharedService.downloading.tsmAuctions = false;
      });
  }

  clearDB(): void {
  }

  setDbVersions(): void {
    this.db.version(2).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS
    }).upgrade(() => {
      console.log('Upgraded db');
    });
    this.db.version(1).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: `id,name,icon,itemClass,itemSubClass,quality,itemSpells,itemSource`,
      pets: this.PET_TABLE_COLUMNS
    });
  }
}
