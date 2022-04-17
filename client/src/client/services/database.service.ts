import {Injectable} from '@angular/core';
import Dexie from 'dexie';
import {Auction, Dashboard, Item, Pet, Profession} from '@shared/models';
import {SharedService} from './shared.service';
import {Recipe} from '../modules/crafting/models/recipe';
import {environment} from '../../environments/environment';
import {Platform} from '@angular/cdk/platform';
import {TsmLuaUtil} from '../utils/tsm/tsm-lua.util';
import {ErrorReport} from '../utils/error-report.util';
import {NPC} from '../modules/npc/models/npc.model';
import {Zone} from '../modules/zone/models/zone.model';
import {BehaviorSubject} from 'rxjs';
import {Report} from '../utils/report.util';
import {GameBuild} from '@shared/utils';
import {AucScanDataImportUtil} from '../modules/auction/utils/auc-scan-data-import.util';
import {DatabaseUtil} from '../utils/database.util';
import {DropsType, NpcSplitType, NpcUtil, SellsType, SkinningType} from '../modules/npc/utils/npc.util';
import {DateUtil} from '@ukon1990/js-utilities';

/**
 * A Class for handeling the indexedDB
 */
@Injectable()
export class DatabaseService {
  public db: Dexie;
  public unsupported: boolean;
  databaseIsReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(public platform: Platform) {
    if (environment.test) {
      this.databaseIsReady.next(true);
      return;
    }
    this.db = new Dexie('wah-db');
    new DatabaseUtil().setVersion(this.db);
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

  private shouldNotUseIndexedDB() {
    return environment.test || this.platform === null || this.unsupported;
  }

  private splitEntries<T>(list: T[], batchSize = 50000): T[][] {
    const result: T[][] = [];
    list.forEach(entry => {
      let index = (result.length || 1) - 1;
      if (result[index] && result[index].length >= batchSize) {
        index++;
      }
      if (!result[index]) {
        result.push([]);
      }
      result[index].push(entry);
    });
    return result;
  }

  addItems(items: Array<Item>, isClassic = false): void {
    console.log('Adding items to classic?', isClassic, isClassic ? 'itemsClassic' : 'items');
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    console.log('Starting to save items into local DB');
    try {
      const start = +new Date();
      for (const list of this.splitEntries(items)) {
        this.db.table(isClassic ? 'itemsClassic' : 'items').bulkPut(list)
          .catch(console.error);
      }
      console.log(`Saved items to local db in ${DateUtil.getDifferenceInSeconds(start, +new Date())}s`);
    } catch (error) {
      ErrorReport.sendError('DatabaseService.addItems', error);
    }
  }

  async getAllItems(isClassic: boolean): Promise<any> {
    if (this.shouldNotUseIndexedDB()) {
      return new Dexie.Promise<any>((resolve, reject) => reject());
    }

    SharedService.downloading.items = true;

    return new Dexie.Promise<any>(async (resolve) => {
      const table = isClassic ? 'itemsClassic' : 'items';
      let items: Item[] = [];
      const start = +new Date();
      const add = (result) => items = [...items, ...result];
      await this.getItemsInBatch(0, 50000, table)
        .then((res) => add(res));
      await this.getItemsInBatch(50001, 100000, table)
        .then((res) => add(res));
      await this.getItemsInBatch(100001, 150000, table)
        .then((res) => add(res));
      await this.getItemsInBatch(150001, 200000, table)
        .then((res) => add(res));
      console.log(`Restored items from local db in ${DateUtil.getDifferenceInSeconds(start, +new Date())}s`);
      SharedService.events.items.emit(true);
      resolve(items);
    });
  }

  private getItemsInBatch(from: number, to: number, table: string) {
    return new Promise<Item[]>((resolve, reject) => {
      this.db.table(table)
        .where(':id')
        .between(from, to)
        .toArray()
        .then(items => {
          SharedService.downloading.items = false;
          resolve(items);
        }).catch(e => {
        console.error('Could not restore items from local DB', e);
        SharedService.downloading.items = false;
        reject(e);
      });
    });
  }

  clearItems(isClassic: boolean): void {
    const table = isClassic ? 'itemsClassic' : 'items';
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    this.db.table(table).clear();
  }

  async addNPCs(list: NPC[]): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      const npcs: NpcSplitType = NpcUtil.split(list);

      const promises: Promise<any>[] = [
        this.db.table('npcsBase').bulkPut(npcs.bases)
          .catch(error => ErrorReport.sendError('DatabaseService.addNPCs.npcsBase', error)),
        this.db.table('npcsDrops').bulkPut(npcs.drops)
          .catch(error => ErrorReport.sendError('DatabaseService.addNPCs.npcsDrops', error)),
        this.db.table('npcsSells').bulkPut(npcs.sells)
          .catch(error => ErrorReport.sendError('DatabaseService.addNPCs.npcsSells', error)),
        this.db.table('npcsSkinns').bulkPut(npcs.skinning)
          .catch(error => ErrorReport.sendError('DatabaseService.addNPCs.npcsSkinns', error)),
      ];
      Promise.all(promises)
        .then(() => {
          resolve();
        })
        .catch(error => {
          ErrorReport.sendError('DatabaseService.addNPCs', error);
          reject(error);
        });
    });
  }

  async getAllNPCs(): Promise<NPC[]> {
    if (this.shouldNotUseIndexedDB()) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return new Promise<NPC[]>((resolve, reject) => {
      console.log('Loading NPCs from local DB');
      const start = +new Date();
      const npcs: NpcSplitType = {
        bases: [],
        sells: [],
        drops: [],
        skinning: [],
      };
      const promises: Promise<any>[] = [
        this.db.table('npcsBase').toArray()
          .then((base: NPC[]) => npcs.bases = base),
        this.db.table('npcsDrops').toArray()
          .then((drops: DropsType[]) => npcs.drops = drops),
        this.db.table('npcsSells').toArray()
          .then((sells: SellsType[]) => npcs.sells = sells),
        this.db.table('npcsSkinns').toArray()
          .then((skinning: SkinningType[]) => npcs.skinning = skinning),
      ];
      Promise.all(promises)
        .then(() => {
          const result = NpcUtil.combine(npcs);
          console.log(`Done loading NPCs from local DB (${DateUtil.getDifferenceInSeconds(start, +new Date())})`);
          resolve(result);
        })
        .catch(reject);
    });
  }

  async clearNPCs(): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }

    await this.db.table('npcs').clear() // Deprecated
      .catch(() => {
      });
    await this.db.table('npcsBase').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearNPCs.npcsBase', error));
    await this.db.table('npcsDrops').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearNPCs.npcsDrops', error));
    await this.db.table('npcsSells').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearNPCs.npcsSells', error));
    await this.db.table('npcsSkinns').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearNPCs.npcsSkinns', error));
  }

  addProfessions(professions: Profession[]): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      if (this.shouldNotUseIndexedDB()) {
        resolve();
        return;
      }
      this.db.table('professions').bulkPut(professions)
        .then(() => resolve())
        .catch(reject);
    });
  }

  getAllProfessions() {
    if (this.shouldNotUseIndexedDB()) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return this.db.table('professions').toArray();
  }

  async clearProfessions() {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    await this.db.table('professions').clear()
      .catch(error =>
        ErrorReport.sendError('DatabaseService.clearProfessions', error));
  }

  async addZones(list: Zone[]): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    await this.db.table('zones').bulkPut(list)
      .catch(console.error);
  }

  async getAllZones(): Promise<Zone[]> {
    if (this.shouldNotUseIndexedDB()) {
      return new Dexie.Promise<any>((resolve, reject) => reject([]));
    }
    return this.db.table('zones').toArray();
  }

  async clearZones(): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    await this.db.table('zones').clear();
  }

  addPets(pets: Array<Pet>): void {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    this.db.table('pets').bulkPut(pets);
  }

  getAllPets(): Dexie.Promise<any> {
    if (this.shouldNotUseIndexedDB()) {
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
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    this.db.table('pets').clear();
  }

  addRecipes(recipes: Recipe[], isClassic?: boolean): void {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    this.db.table(isClassic ? 'recipesClassic' : 'recipes2').bulkPut(recipes)
      .catch(e =>
        ErrorReport.sendError('DatabaseService.addRecipes', e));
  }

  getAllRecipes(isClassic?: boolean): Promise<Recipe[]> {
    SharedService.downloading.recipes = true;
    return new Promise((resolve, reject) => {
      if (this.shouldNotUseIndexedDB()) {
        return resolve([]);
      }

      this.db.table(isClassic ? 'recipesClassic' : 'recipes2')
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

  async addDashboards(boards: Dashboard[]): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    await this.db.table('dashboards').bulkPut(boards)
      .catch(e =>
        ErrorReport.sendError('DatabaseService.addDashboards', e));
  }

  removeDashboard(id: string): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      this.db.table('dashboards').delete(id)
        .then(resolve)
        .catch((reject));
    });
  }

  clearDashboards() {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      this.db.table('dashboards').clear()
        .then(resolve)
        .catch((reject));
    });
  }

  getDashboards(): Promise<Dashboard[]> {
    return new Promise((resolve, reject) => {
      if (this.shouldNotUseIndexedDB()) {
        return resolve([]);
      }

      this.db.table('dashboards')
        .toArray()
        .then(boards => {
          console.log('Restored dashboards from local DB');
          resolve(boards);
          SharedService.events.recipes.emit(true);
        }).catch(error => {
        console.error('Could not restore dashboards from local DB', error);
        ErrorReport.sendError('DatabaseService.getDashboards', error);
        reject(error);
      });
    });
  }

  async clearRecipes(isClassic?: boolean): Promise<void> {
    if (this.shouldNotUseIndexedDB()) {
      return;
    }
    await this.db.table(isClassic ? 'recipesClassic' : 'recipes2').clear()
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
    return environment.test || this.shouldNotUseIndexedDB();
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

  async clearWowDataFromDB(): Promise<void> {
    await this.clearItems(true);
    await this.clearItems(false);
    await this.clearNPCs();
    await this.clearPets();
    await this.clearRecipes();
    await this.clearRecipes(true);
    await this.clearZones();
    await this.clearProfessions();
  }

  async clearUserData(): Promise<void> {
    await Promise.all([
      await this.clearDashboards(),
    ]).catch(console.error);
  }

  deleteDB(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.shouldNotUseIndexedDB()) {
        resolve();
        return;
      }
      return this.db.delete()
        .then(() => resolve())
        .catch(() => resolve());
    });
  }
}