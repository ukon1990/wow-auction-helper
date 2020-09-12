import {EventEmitter, Injectable} from '@angular/core';
import {SharedService} from './shared.service';
import {HttpClient} from '@angular/common/http';
import {Item} from '../models/item/item';
import {Endpoints} from './endpoints';
import {DatabaseService} from './database.service';
import {WoWHeadSoldBy} from '../models/item/wowhead';
import {ErrorReport} from '../utils/error-report.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ItemOverrides} from '../overrides/item.overrides';
import {Platform} from '@angular/cdk/platform';
import {Report} from '../utils/report.util';
import {ItemPriceEntry} from '../modules/item/models/item-price-entry.model';
import {RealmService} from './realm.service';
import {BehaviorSubject} from 'rxjs';
import {AuctionItemStat} from '../../../../api/src/utils/auction-processor.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

class ItemResponse {
  timestamp: Date;
  items: Item[];
}

@Injectable()
export class ItemService {
  static missingQueue: Map<string, number> = new Map<string, number>();
  static itemSelection: EventEmitter<number> = new EventEmitter<number>();
  static list: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
  static mapped: BehaviorSubject<Map<number, Item>> = new BehaviorSubject<Map<number, Item>>(new Map<number, Item>());
  private historyMap: BehaviorSubject<Map<number, Map<string, any>>> = new BehaviorSubject(new Map());
  readonly LOCAL_STORAGE_TIMESTAMP = 'timestamp_items';
  private sm = new SubscriptionManager();

  constructor(private _http: HttpClient,
              private dbService: DatabaseService,
              public snackBar: MatSnackBar,
              private realmService: RealmService,
              public platform: Platform) {
    this.sm.add(this.realmService.events.realmStatus, () => {
      this.historyMap.next(new Map());
    });
  }

  async loadItems(latestTimestamp: Date) {
    await this.dbService.getAllItems()
      .then(async (items) => {
        if (items.length === 0) {
          delete localStorage['timestamp_items'];
        }
        this.handleItems({items, timestamp: latestTimestamp});
      })
      .catch(async error => {
        delete localStorage['timestamp_items'];
        ErrorReport.sendError('ItemService.loadItems', error);
      });
    const timestamp = localStorage.getItem(this.LOCAL_STORAGE_TIMESTAMP);

    if (!timestamp || +new Date(latestTimestamp) > +new Date(timestamp) || !ItemService.list.value.length) {
      await this.getItems();
    }
  }

  getBonusIds(): Promise<void> {
    return this._http.get('/assets/data/bonusIds.json').toPromise()
      .then((data) => {
        SharedService.bonusIdMap = data;
      })
      .catch(console.error);
  }

  getTooltip(id: number, bonusIds: number[]): Promise<string> {
    let url = 'https://www.wowhead.com/tooltip/item/' + id + '?';
    if (bonusIds && bonusIds.length) {
      url += 'bonus=' + bonusIds.join(':');
    }
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .toPromise()
        .then(r => resolve(r['tooltip']))
        .catch(reject);
    });
  }

  /*
  addItem(itemID: number): Promise<any> {
    Report.debug('Attempting to add item data for ' + itemID);
    Report.send('addItem', 'ItemService', itemID);

    return this._http.post(
      Endpoints.getLambdaUrl(`item/${itemID}`), {
        locale: localStorage['locale']
      })
      .toPromise()
      .then((item: Item) => {
        if (item['error']) {
          ErrorReport.sendHttpError(item['error']);
          return;
        }
        SharedService.items[item.id] = (item as Item);
        if (SharedService.auctionItemsMap[item.id]) {
          SharedService.auctionItemsMap[item.id].name = item.name;
          SharedService.auctionItemsMap[item.id].vendorSell = item.sellPrice;
        }
        this.dbService.addItems([item]);
        return item;
      }).catch(error => {
        console.error('Could not get item with ID ' + itemID, error);
        ErrorReport.sendHttpError(error);
        return error;
      }) as Promise<any>;
  }*/

  async getItems(): Promise<any> {
    const locale = localStorage['locale'];
    console.log('Downloading items');
    SharedService.downloading.items = true;

    this.dbService.clearItems();
    SharedService.itemsUnmapped.length = 0;
    await this._http.get(`${Endpoints.S3_BUCKET}/item/${locale}.json.gz?rand=${Math.round(Math.random() * 10000)}`)
      .toPromise()
      .then((response: ItemResponse) => {
        SharedService.itemsUnmapped = [];
        Object.keys(SharedService.items).forEach(id =>
          delete SharedService.items[id]);
        SharedService.downloading.items = false;
        this.handleItems(response);
      })
      .catch(error => {
        ErrorReport.sendHttpError(error);
        SharedService.downloading.items = false;
      });
  }

  handleItems(items: ItemResponse): void {
    const missingItems: number[] = [];
    SharedService.downloading.items = false;
    const list: Item[] = [];
    const mapped = new Map<number, Item>();

    // TODO: Remove or move?
    items.items.forEach((item: Item) => {
      // Making sure that the tradevendor item names are updated in case of locale change
      if (SharedService.tradeVendorMap[item.id]) {
        SharedService.tradeVendorMap[item.id].name = item.name;
      }

      if (item.itemClass === 8) {
        item.itemClass = 0;
        item.itemSubClass = 6;
      }

      SharedService.items[item.id] = item;
      mapped.set(item.id, item);
      list.push(item);
      SharedService.itemsUnmapped.push(item);

      if (item.itemSource && item.itemSource.containedInItem && item.itemSource.containedInItem.length > 0) {
        item.itemSource.containedInItem.forEach(i =>
          this.setLocaleForSourceItems(i, missingItems));
      }
      if (item.itemSource && item.itemSource.milledFrom && item.itemSource.milledFrom.length > 0) {
        item.itemSource.milledFrom.forEach(i =>
          this.setLocaleForSourceItems(i, missingItems));
      }
      if (item.itemSource && item.itemSource.prospectedFrom && item.itemSource.prospectedFrom.length > 0) {
        item.itemSource.prospectedFrom.forEach(i =>
          this.setLocaleForSourceItems(i, missingItems));
      }

      this.addItemToBoughtFromVendorList(item);
    });

    if (missingItems.length > 0) {
      // TODO: when I have time -> this.addItems(missingItems);
    }

    if (this.platform !== null && !this.platform.WEBKIT) {
      this.dbService.addItems(items.items);
      localStorage[this.LOCAL_STORAGE_TIMESTAMP] = items.timestamp;
    }
    SharedService.events.items.emit(true);
    ItemService.mapped.next(mapped);
    ItemService.list.next(list);
    console.log('Items download is completed');
  }

  setLocaleForSourceItems(item: any, missingItems: number[]): void {
    if (SharedService.items[item.id]) {
      item.name = SharedService.items[item.id].name;
    } else {
      missingItems.push(item.id);
    }
  }

  updateItem(itemID: number): Promise<any> {
    return this._http.patch(
      Endpoints.getLambdaUrl(`item/${itemID}`),
      {locale: 'en_GB'})
      .toPromise() as Promise<any>;
  }

  getPriceHistory(id: number, petSpeciesId: number = -1, bonusIds?: any[]): Promise<any> {
    const storedId = `${id}-${petSpeciesId}-${AuctionItemStat.bonusId(bonusIds)}`;
    const startTime = +new Date();
    const ahId = this.realmService.events.realmStatus.value.id,
      realmMap = this.historyMap.value;
    if (realmMap.get(ahId) && realmMap.get(ahId).get(storedId)) {
      return new Promise<ItemPriceEntry[]>(resolve => {
        Report.send('getPriceHistory', 'ItemService',
          `Time to fetch history from memory, for ahId=${ahId} and item id = ${id} was ${+new Date() - startTime}ms`);
        resolve(realmMap.get(ahId).get(storedId));
      });
    }
    return this._http.post(Endpoints.getLambdaUrl('item/history'),
      {
        id,
        ahId,
        petSpeciesId,
        bonusIds,
        onlyHourly: false
      })
      .toPromise()
      .then((entries: ItemPriceEntry[]) => {
        if (!realmMap.has(ahId)) {
          realmMap.set(ahId, new Map());
        }
        realmMap.get(ahId).set(storedId, entries);
        Report.send('getPriceHistory', 'ItemService',
          `Time to fetch history from DB, for ahId=${ahId} and item id = ${storedId} was ${+new Date() - startTime}ms`);
        this.historyMap.next(realmMap);
        return entries;
      })
      .catch(console.error) as Promise<ItemPriceEntry[]>;
  }

  /**
   * Throtteled adding of missing items
   *
   * @param {Array<number>} itemsToAdd A list of item id's that needs to be added
   * @param {number} [i] the next index to add
   * @returns {void}
   * @memberof ItemService
   */
  addItems(itemsToAdd: Array<number>, i?: number): void {/*
    if (!i) {
      i = 0;
    }

    if (itemsToAdd.length === 0) {
      return;
    }

    setTimeout(() => {
      if (itemsToAdd[i]) {
        SharedService.items[i] = new Item();
        this.addItem(itemsToAdd[i]);
      }

      i++;
      if (i === itemsToAdd.length) {
        console.log(`Done adding ${i} items`);
        return;
      } else {
        this.addItems(itemsToAdd, i);
      }
    }, 100);*/
  }

  addItemToBoughtFromVendorList(item: Item): void {
    if (item.itemSource && item.itemSource.soldBy) {
      if (ItemOverrides.NOT_SOLD_BY_VENDOR[item.id]) {
        item.itemSource.soldBy = [];
        item.isBoughtForGold = false;
        return;
      }
      item.itemSource.soldBy.forEach((soldBy: WoWHeadSoldBy) => {
        item.isBoughtForGold = !soldBy.currency && soldBy.cost > 0;
        item.vendorBoughtLimit = soldBy.stock;
      });
    }
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', {duration: 3000});
  }

  private isTimestampNotDefined(timestamp: string) {
    return timestamp === undefined || timestamp === 'undefined';
  }
}
