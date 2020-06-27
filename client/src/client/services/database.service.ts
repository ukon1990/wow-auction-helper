import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Item} from '../models/item/item';
import {Auction} from '../modules/auction/models/auction.model';
import {SharedService} from './shared.service';
import {TSM} from '../modules/auction/models/tsm.model';
import {Pet} from '../modules/pet/models/pet';
import {Recipe} from '../modules/crafting/models/recipe';
import {environment} from '../../environments/environment';
import {Platform} from '@angular/cdk/platform';
import {TsmLuaUtil} from '../utils/tsm/tsm-lua.util';
import {ErrorReport} from '../utils/error-report.util';
import {NPC} from '../modules/npc/models/npc.model';
import {Zone} from '../modules/zone/models/zone.model';
import {BehaviorSubject} from 'rxjs';
import {Report} from '../utils/report.util';
import {GameBuild} from '../utils/game-build.util';
import {AucScanDataImportUtil} from '../modules/auction/utils/auc-scan-data-import.util';
import {Profession} from '../../../../api/src/profession/model';

/**
 * A Class for handeling the indexedDB
 */
@Injectable()
export class DatabaseService {
  private db: Dexie;
  private unsupported: boolean;

  readonly TSM_TABLE_COLUMNS = 'Id,Name,Level,VendorBuy,VendorSell,MarketValue,MinBuyout,HistoricalPrice,'
    + 'RegionMarketAvg,RegionMinBuyoutAvg,RegionHistoricalPrice,RegionSaleAvg,'
    + 'RegionAvgDailySold,RegionSaleRate';
  readonly WOWUCTION_TABLE_COLUMNS = 'id,mktPrice,avgDailyed,avgDailySold,estDemand,dailyPriceChange';
  readonly ITEM_TABLE_COLUMNS = 'id,name,icon,itemLevel,itemClass,itemSubClass,quality,itemSpells'
    + ',itemSource,buyPrice,sellPrice,itemBind,minFactionId,minReputation';
  readonly PET_TABLE_COLUMNS = 'speciesId,petTypeId,creatureId,name,icon,description,source';
  readonly AUCTIONS_TABLE_COLUMNS = 'auc,item,owner,ownerRealm,bid,buyout,quantity,timeLeft,rand,seed,context,realm,timestamp';
  readonly RECIPE_TABLE_COLUMNS = 'id,icon,name,description,rank,craftedItemId,hordeCraftedItemId,' +
    'allianceCraftedItemId,minCount,maxCount,procRate,professionId,skillTierId,reagents';
  readonly TSM_ADDON_HISTORY = 'timestamp,data';
  readonly ADDON = 'id,name,gameVersion,timestamp,data';
  readonly NPC_TABLE_COLUMNS = 'id,name,zoneId,coordinates,sells,drops,skinning,' +
    'expansionId,isAlliance,isHorde,minLevel,maxLevel,tag,type,classification';
  readonly ZONE_TABLE_COLUMNS = 'id,name,patch,typeId,parentId,parent,territoryId,minLevel,maxLevel';
  readonly PROFESSION_TABLE_COLUMNS = 'id,name,description,icon,type,skillTiers';

  databaseIsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(public platform: Platform) {
    if (environment.test) {
      this.databaseIsReady.next(true);
      return;
    }
    this.db = new Dexie('wah-db');
    this.setDbVersions();
    this.db.open()
      .then(async (dx) => {
        const storageName = 'previousDBVersion';
        const previousVersion = localStorage.getItem(storageName);
        if (!previousVersion || +previousVersion < dx.verno) {
          // There might be a new schema in the DB model, so we should re-fetch all data to be safe
          await this.clearWowDataFromDB();
          localStorage.setItem(storageName, '' + dx.verno);
          console.log(`The database version is updated from schema ${previousVersion} to ${dx.verno}. Data is thus cleared.`);
        }
        this.databaseIsReady.next(true);
        console.log('wah-db successfully started');
      }).catch(error => {
      this.unsupported = true;
      this.databaseIsReady.next(true);
      console.log('Unable to start indexedDB', error);
    });
  }

  addItems(items: Array<Item>): void {
    if (environment.test || this.unsupported) {
      return;
    }
    this.db.table('items').bulkPut(items)
      .catch(e =>
        ErrorReport.sendError('DatabaseService.addItems', e));
  }

  async getAllItems(): Promise<any> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject());
    }

    SharedService.downloading.items = true;

    return new Dexie.Promise<any>(async (resolve) => {
      await this.getItemsInBatch(0, 50000);
      await this.getItemsInBatch(50001, 100000);
      await this.getItemsInBatch(100001, 200000);
      await this.getItemsInBatch(200001, 1000000);
      SharedService.events.items.emit(true);
      resolve();
    });
  }

  private getItemsInBatch(from: number, to: number) {
    return this.db.table('items')
      .where(':id')
      .between(from, to)
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

  async addNPCs(list: NPC[]): Promise<void> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return;
    }
    await this.db.table('npcs').bulkPut(list);
  }

  async getAllNPCs(): Promise<NPC[]> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return this.db.table('npcs').toArray();
  }

  async clearNPCs(): Promise<void> {
    await this.db.table('npcs').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearNPCs', error));
  }

  addProfessions(professions: Profession[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
        resolve();
        return;
      }
      this.db.table('professions').bulkPut(professions)
        .then(() => resolve())
        .catch(reject);
    });
  }

  getAllProfessions() {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return this.db.table('professions').toArray();
  }

  async clearProfessions() {
    await this.db.table('professions').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearProfessions', error));
  }

  async addZones(list: Zone[]): Promise<void> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return;
    }
    await this.db.table('zones').bulkPut(list)
      .catch(console.error);
  }

  async getAllZones(): Promise<Zone[]> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return this.db.table('zones').toArray();
  }

  async clearZones(): Promise<void> {
    await this.db.table('zones').clear();
  }

  addPets(pets: Array<Pet>): void {
    if (environment.test || this.unsupported) {
      return;
    }
    this.db.table('pets').bulkPut(pets);
  }

  getAllPets(): Dexie.Promise<any> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }

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

  addRecipes(recipes: Recipe[]): void {
    if (environment.test || this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return;
    }
    this.db.table('recipes2').bulkPut(recipes)
      .catch(e =>
        ErrorReport.sendError('DatabaseService.addRecipes', e));
  }

  getAllRecipes(): Promise<Recipe[]> {
    SharedService.downloading.recipes = true;
    return new Promise((resolve, reject) => {
      if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
        return resolve([]);
      }

      this.db.table('recipes2')
        .toArray()
        .then(recipes => {
          SharedService.downloading.recipes = false;
          console.log('Restored recipes from local DB');
          resolve(recipes);
          SharedService.events.recipes.emit(true);
        }).catch(error => {
        console.error('Could not restore recipes from local DB', error);
        ErrorReport.sendError('DatabaseService.getAllRecipes', error);
        SharedService.downloading.recipes = false;
        reject(error);
      });
    });
  }

  async clearRecipes(): Promise<void> {
    await this.db.table('recipes2').clear()
      .catch(e =>
        ErrorReport.sendError('DatabaseService.clearRecipes', e));
  }

  addAuction(auction: Auction): void {
    if (this.isUnsupportedBrowser()) {
      return;
    }
    this.db.table('auctions').add(auction)
      .then(r =>
        console.log('Successfully added auctions to local DB'))
      .catch(e =>
        ErrorReport.sendError('DatabaseService.addAuction', e));
  }

  private isUnsupportedBrowser() {
    return environment.test || this.platform === null || this.platform.WEBKIT || this.unsupported;
  }

  addAddonData(name: string, data: any, gameVersion: number, lastModified: number): void {
    if (this.isUnsupportedBrowser()) {
      return;
    }
    localStorage.setItem('timestamp_addons', '' + +new Date());

    this.db.table('addons')
      .put({
        id: `${gameVersion}-${name}`,
        name,
        timestamp: lastModified,
        gameVersion,
        data: data
      })
      .then(r => {
        localStorage[`timestamp_addon_import_${name}`] = lastModified;
        console.log('Successfully added tsm addon history data to local DB');
      })
      .catch(error =>
        ErrorReport.sendError('DatabaseService.addTSMAddonData', error));
  }


  getAddonData(): Dexie.Promise<any> {
    if (this.isUnsupportedBrowser()) {
      return new Dexie.Promise<any>((resolve) => resolve([]));
    }

    return this.db.table('addons')
      .toArray()
      .then(addons => {
        Report.debug('addon', addons);
        if (!addons[0]) {
          return;
        }
        Report.debug('Addon data', addons);
        addons.forEach(({id, name, gameVersion, data, lastModified}) => {
          if (!SharedService.addonData[gameVersion]) {
            SharedService.addonData[gameVersion] = {};
          }

          const ADDONS = GameBuild.ADDONS,
            addonData = SharedService.addonData[gameVersion];

          Report.debug('addon', {
            id, name, gameVersion, data, lastModified
          }, addons);

          switch (name) {
            case ADDONS.TSM.file:
              addonData[ADDONS[name]] = new TsmLuaUtil().convertList(data);
              break;
            case ADDONS.Auctioneer.file:
              AucScanDataImportUtil.import(data);
              break;
          }
        });
        console.log('Restored TSM addon historical data from local DB');
      })
      .catch(e => {
        ErrorReport.sendError('DatabaseService.getAddonData', e);
        SharedService.downloading.tsmAuctions = false;
      });
  }

  addTSMItems(tsm: Array<TSM>): void {
    if (environment.test || this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return;
    }
    this.db.table('tsm').clear();
    this.db.table('tsm')
      .bulkPut(tsm)
      .then(r => console.log('Successfully added tsm data to local DB'))
      .catch(e => ErrorReport.sendError('DatabaseService.addTSMItems', e));
  }

  getTSMItems(): Dexie.Promise<any> {
    if (this.platform === null || this.platform.WEBKIT || this.unsupported) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }

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
        ErrorReport.sendError('DatabaseService.getTSMItems', e);
        SharedService.downloading.tsmAuctions = false;
      });
  }

  async clearWowDataFromDB(): Promise<void> {
    await this.clearItems();
    await this.clearNPCs();
    await this.clearPets();
    await this.clearRecipes();
    await this.clearZones();
    await this.clearProfessions();
  }

  deleteDB(): void {
    this.db.delete();
  }

  setDbVersions(): void {

    this.db.version(10).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes2: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    });

    this.db.version(9).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    });

    this.db.version(8).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: this.RECIPE_TABLE_COLUMNS,
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      professions: this.PROFESSION_TABLE_COLUMNS,
      addons: this.ADDON
    });
    this.db.version(7).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      'classic-auctions': this.AUCTIONS_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      addons: this.ADDON
    });
    this.db.version(6).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      npcs: this.NPC_TABLE_COLUMNS,
      zones: this.ZONE_TABLE_COLUMNS,
      tsmAddonHistory: this.TSM_ADDON_HISTORY
    });

    this.db.version(5).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion',
      tsmAddonHistory: this.TSM_ADDON_HISTORY
    });
    this.db.version(4).stores({
      auctions: this.AUCTIONS_TABLE_COLUMNS,
      wowuction: this.WOWUCTION_TABLE_COLUMNS,
      tsm: this.TSM_TABLE_COLUMNS,
      items: this.ITEM_TABLE_COLUMNS,
      pets: this.PET_TABLE_COLUMNS,
      recipes: 'spellID,itemID,name,profession,rank,minCount,maxCount,reagents,expansion'
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
