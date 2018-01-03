import { Recipe } from '../crafting/recipe';
import { Item } from '../item/item';
import { itemClasses } from '../item/item-classes';

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
    if (localStorage[this.storageName] !== undefined) {
      const wl: any = JSON.parse(localStorage[this.storageName]);
      if (wl.groups) {
        this.groups = wl.groups;
        this.groups.forEach(g => {
          if (!this.groupsMap[g.name]) {
            this.groupsMap[g.name] = new WatchlistGroup(g.name);
          }
          this.groupsMap[g.name].items.push(g);
        });
      }
    }
  }

  isTargetMatch(item: WatchlistItem): boolean {
    return true;
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
    this.groupsMap[group.name].items.splice(index, 1);
    this.save();
  }

  save(): void {
    localStorage[this.storageName] = JSON.stringify(
      {groups: this.groups});
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
  target: number;
  targetType: string;
  criteria: string;
  value = 0;
}
