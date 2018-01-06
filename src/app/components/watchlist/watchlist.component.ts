import { Component, OnInit } from '@angular/core';
import { Watchlist, WatchlistItem, WatchlistGroup } from '../../models/watchlist/watchlist';
import { SharedService } from '../../services/shared.service';
import { Recipe } from '../../models/crafting/recipe';

@Component({
  selector: 'wah-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  selectedItem: WatchlistItem;
  selectedGroup: WatchlistGroup;
  selectedIndex: number;

  constructor() {
  }

  ngOnInit() {
  }

  /* istanbul ignore next */
  getWatchlist(): Watchlist {
    return SharedService.user.watchlist;
  }

  close(): void {
    this.selectedGroup = undefined;
    this.selectedItem = undefined;
    this.selectedIndex = undefined;
  }

  edit(group: WatchlistGroup, item: WatchlistItem, index: number): void {
    console.log('asd');
    this.selectedGroup = group;
    this.selectedItem = item;
    this.selectedIndex = index;
  }

  delete(group: WatchlistGroup, watchlistItem: WatchlistItem, index: number): void {
    SharedService.user.watchlist.removeItem(group, index);
  }
}
