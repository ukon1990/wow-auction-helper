import { Recipe } from '../crafting/recipe';
import { Item } from '../item/item';
import { itemClasses } from '../item/item-classes';
import { SharedService } from '../../services/shared.service';
import { defaultWatchlist } from './default-watchlist';

export class Watchlist {
  private storageName = 'watchlist';
  readonly COMPARABLE_VARIABLES = {
    BUYOUT: 'buyout',
    BID: 'bid',
    MARKET_VALUE: 'mktPrice',
    AVG_DAILY_SOLD: 'avgDailySold',
    REGIONAL_AVG_SALE_PRICE: 'regionSaleAvg',
    REGIONAL_SALE_RATE: 'regionSaleRate',
    QUANTITY_TOTAL: 'quantityTotal'
  };
  readonly CRITERIAS = {
    BELOW: 'below',
    EQUAL: 'equal',
    ABOVE: 'above'
  };

  readonly TARGET_TYPES = {
    PERCENT: 'percent',
    GOLD: 'gold',
    QUANTITY: 'quantity'
  };

  groups: Array<WatchlistGroup> = new Array<WatchlistGroup>();
  groupsMap: Map<string, WatchlistGroup> = new Map<string, WatchlistGroup>();

  constructor() {
    this.restore();
  }

  restore(): void {
    let shouldSave = false;
    if (localStorage[this.storageName] !== undefined) {
      const wl: any = JSON.parse(localStorage[this.storageName]);
      if (wl.items) {
        wl.groups = [];
        Object.keys(wl.items).forEach(group => {
          const g = new WatchlistGroup(group);
          wl.items[group].forEach(item => {
            if (item) {
              g.items.push(this.mapOldVersionToNew(item));
            }
          });
          wl.groups.push(g);
        });
        shouldSave = true;
      }
      console.log(wl);
      if (wl.groups) {
        this.groups = wl.groups;
        this.groups.forEach(g => {
          if (!this.groupsMap[g.name]) {
            this.groupsMap[g.name] = new WatchlistGroup(g.name);
          }
          this.groupsMap[g.name].items.push(g);
        });
      }
      console.log(JSON.stringify(this.groups));
    } else {
      this.groups = defaultWatchlist;
    }

    if (shouldSave) {
      this.save();
    }
  }

  isTargetMatch(item: WatchlistItem): boolean {
    if (!SharedService.auctionItemsMap[item.itemID]) {
      return false;
    }

    switch (item.criteria) {
      case this.CRITERIAS.BELOW:
        return this.getTypeValue(item) < item.value;
      case this.CRITERIAS.EQUAL:
        return this.getTypeValue(item) === item.value;
      case this.CRITERIAS.ABOVE:
        return this.getTypeValue(item) > item.value;
    }
    return false;
  }

  private getTypeValue(item: WatchlistItem): number {
    switch (item.targetType) {
      case this.TARGET_TYPES.QUANTITY:
        return SharedService.auctionItemsMap[item.itemID][item.compareTo];
      case this.TARGET_TYPES.GOLD:
        return SharedService.auctionItemsMap[item.itemID][item.compareTo];
      case this.TARGET_TYPES.PERCENT:
        return  (1 - (SharedService.auctionItemsMap[item.itemID].buyout /
        SharedService.auctionItemsMap[item.itemID][item.compareTo])) * 100;
    }
    return 0;
  }

  addGroup(name: string): void {
    if (this.groupsMap[name]) {
      return;
    }
    this.groupsMap[name] = new WatchlistGroup(name);
    this.groups.push(this.groupsMap[name]);
  }

  moveItem(fromGroup: WatchlistGroup, toGroup: WatchlistGroup, index: number): void {
    toGroup.items.push(fromGroup.items[index]);
    this.removeItem(fromGroup, index);
  }

  addItem(group: WatchlistGroup, watchlistItem: WatchlistItem): void {
    group.items.push(watchlistItem);
    this.save();
  }

  removeItem(group: WatchlistGroup, index: number): void {
    group.items.splice(index, 1);
    this.save();
  }

  save(): void {
    localStorage[this.storageName] = JSON.stringify(
      { groups: this.groups });
  }

  mapOldVersionToNew(item: any): WatchlistItem {
    return {
      itemID: parseInt(item.id, 10),
      name: item.name,
      compareTo: item.compareTo,
      value: item.value,
      target: 0,
      targetType: this.TARGET_TYPES.GOLD,
      criteria: item.criteria,
      minCraftingProfit: item.minCraftingProfit ? item.minCraftingProfit : 0
    };
  }
}

export class WatchlistGroup {
  name: string;
  items: Array<WatchlistItem> = new Array<WatchlistItem>();

  constructor(name: string, items?: Array<WatchlistItem>) {
    this.name = name;

    if (items) {
      this.items = items;
    }
  }
}

export class WatchlistItem {
  itemID: number;
  name: string;
  compareTo: string;
  target?: number;
  targetType: string;
  criteria: string;
  minCraftingProfit: number;
  value = 0;

  constructor(itemID?: any) {
    itemID = parseInt(itemID, 10);
    if (itemID && SharedService.items[itemID]) {
      const wl = SharedService.user.watchlist;
      this.itemID = itemID;
      this.name = SharedService.items[itemID].name;
      this.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
      this.targetType = wl.TARGET_TYPES.GOLD;
      this.criteria = wl.CRITERIAS.BELOW;
      this.minCraftingProfit = 0;
    }
  }
}
