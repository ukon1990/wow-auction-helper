import {WatchlistItem} from './watchlist-item.model';

export class WatchlistGroup {
  name: string;
  items: Array<WatchlistItem> = new Array<WatchlistItem>();
  matchSaleRate = 0;
  matchDailySold = 0;
  hide: false;

  constructor(name: string, items?: Array<WatchlistItem>) {
    this.name = name;

    if (items) {
      this.items = items;
    }
  }
}
