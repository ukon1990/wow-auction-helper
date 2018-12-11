import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Item} from '../models/item/item';
import {Auction} from '../models/auction/auction';
import {AuctionHandler} from '../models/auction/auction-handler';
import {SharedService} from './shared.service';
import {TSM} from '../models/auction/tsm';
import {WoWUction} from '../models/auction/wowuction';
import {PetsService} from './pets.service';
import {Pet} from '../models/pet';
import {Recipe} from '../models/crafting/recipe';
import {environment} from '../../environments/environment';

/**
 * A Class for handeling the indexedDB
 */
@Injectable()
export class DatabaseService {
  private db: Dexie;

  readonly TSM_TABLE_COLUMNS = 'Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,'
    + 'RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,'
    + 'RegionAvgDailySold,RegionSaleRate';
  readonly WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,dailyPriceChange';
  readonly ITEM_TABLE_COLUMNS = 'id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells'
    + ',itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation';
  readonly PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source';
  readonly AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';
  readonly RECIPE_TABLE_COLUMNS = 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion';

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
    if (environment.test) {
      return;
    }
    this.db.table('items').bulkPut(items);
  }

  getAllItems(): Dexie.Promise<any> {
    SharedService.downloading.items = true;
    return this.db.table('items')
      .toArray()
      .then(items => {
        SharedService.downloading.items = false;
        SharedService.itemsUnmapped = SharedService.itemsUnmapped.concat(items);
        items.forEach(i => {
          SharedService.items[i.id] = i;
        });
      }).catch(e => {
        console.error('Could not restore items from local DB', e);
        SharedService.downloading.items = false;
      });
  }

  clearItems(): void {
    this.db.table('items').clear();
  }

  addPets(pets: Array<Pet>): void {
    if (environment.test) {
      return;
    }
    this.db.table('pets').bulkPut(pets);
  }

  getAllPets(): Dexie.Promise<any> {
    SharedService.downloading.pets = true;
    return this.db.table('pets')
      .toArray()
      .then(pets => {
        SharedService.downloading.pets = false;
        pets.forEach(i => {
          SharedService.pets[i.speciesId] = i;
        });
        console.log('Restored pets from local DB');
      }).catch(e => {
        console.error('Could not restore pets from local DB', e);
        SharedService.downloading.pets = false;
      });
  }

  clearPets(): void {
    this.db.table('pets').clear();
  }

  addRecipes(recipes: Array<Recipe>): void {
    if (environment.test) {
      return;
    }
    this.db.table('recipes').bulkPut(recipes);
  }

  getAllRecipes(): Dexie.Promise<any> {
    SharedService.downloading.recipes = true;
    return this.db.table('recipes')
      .toArray()
      .then(recipes => {
        SharedService.downloading.recipes = false;
        SharedService.recipes = recipes as Array<Recipe>;
        console.log('Restored recipes from local DB');
      }).catch(e => {
        console.error('Could not restore recipes from local DB', e);
        SharedService.downloading.recipes = false;
      });
  }

  clearRecipes(): void {
    this.db.table('recipes').clear();
  }


  addAuction(auction: Auction): void {
    if (environment.test) {
      return;
    }
    this.db.table('auctions').add(auction)
      .then(r =>
        console.log('Successfully added auctions to local DB'))
      .catch(e =>
        console.error('Could not add auctions to local DB', e));
  }

  clearAuctions(): void {
    this.db.table('auctions').clear();
  }


  addAuctions(auctions: Array<Auction>): void {
    if (environment.test) {
      return;
    }
    this.db.table('auctions').clear();
    this.db.table('auctions')
      .bulkAdd(auctions)
      .then(r => console.log('Successfully added auctions to local DB'))
      .catch(e => console.error('Could not add auctions to local DB', e));
  }

  getAllAuctions(petService?: PetsService): Dexie.Promise<any> {
    SharedService.downloading.auctions = true;
    return this.db.table('auctions')
      .toArray()
      .then(auctions => {
        SharedService.downloading.auctions = false;
        AuctionHandler.organize(auctions, petService);
        console.log('Restored auction from local DB');
      }).catch(e => {
        console.error('Could not restore auctions from local DB', e);
        SharedService.downloading.auctions = false;
      });
  }

  addWoWUctionItems(wowuction: Array<WoWUction>): void {
    if (environment.test) {
      return;
    }
    this.db.table('wowuction').clear();
    this.db.table('wowuction')
      .bulkPut(wowuction)
      .then(r => console.log('Successfully added WoWUction data to local DB'))
      .catch(e => console.error('Could not add WoWUction data to local DB', e));
  }

  getWoWUctionItems(): Dexie.Promise<any> {
    SharedService.downloading.wowUctionAuctions = true;
    return this.db.table('wowuction')
      .toArray()
      .then(wowuction => {
        (<WoWUction[]>wowuction).forEach(a => {
          SharedService.wowUction[a.id] = a;
        });
        SharedService.downloading.wowUctionAuctions = false;
        console.log('Restored WoWUction data from local DB');
      })
      .catch(e => {
        console.error('Could not restore WoWUction data', e);
        SharedService.downloading.wowUctionAuctions = false;
      });
  }

  addTSMItems(tsm: Array<TSM>): void {
    if (environment.test) {
      return;
    }
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
    this.db.delete();
  }

  setDbVersions(): void {
    this.db.version(4).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: this.RECIPE_TABLE_COLUMNS
    });
    this.db.version(3).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS
    }).upgrade(() => {
      console.log('Upgraded db');
    });

    this.db.version(2).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: 'id,mktPrice,avgDailyPosted,avgDailySold,estDemand,realm',
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
