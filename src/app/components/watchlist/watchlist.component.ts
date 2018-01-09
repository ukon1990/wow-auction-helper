import { Component, OnInit } from '@angular/core';
import { Watchlist, WatchlistItem, WatchlistGroup } from '../../models/watchlist/watchlist';
import { SharedService } from '../../services/shared.service';
import { Recipe } from '../../models/crafting/recipe';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { Item } from '../../models/item/item';

@Component({
  selector: 'wah-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  itemSearchForm: FormControl = new FormControl();
  filteredItems: Observable<any>;
  selectedItem: WatchlistItem;
  selectedGroup: WatchlistGroup;
  selectedIndex: number;

  constructor() {
    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
      startWith(''),
      map(name => this.filter(name))
      );
  }

  ngOnInit() {
  }

  /* istanbul ignore next */
  getWatchlist(): Watchlist {
    if (!SharedService.user.watchlist) {
      SharedService.user.watchlist = new Watchlist();
    }
    return SharedService.user.watchlist;
  }

  close(): void {
    this.selectedGroup = undefined;
    this.selectedItem = undefined;
    this.selectedIndex = undefined;
  }

  add(group: WatchlistGroup, item: Item): void {
    const wlItem = new WatchlistItem(item.id);
    SharedService.user.watchlist.addItem(group, wlItem);
    this.edit(group, wlItem, SharedService.user.watchlist.groups.length - 1);
    this.itemSearchForm.setValue('');
  }

  edit(group: WatchlistGroup, item: WatchlistItem, index: number): void {
    this.selectedGroup = group;
    this.selectedItem = item;
    this.selectedIndex = index;
  }

  delete(group: WatchlistGroup, watchlistItem: WatchlistItem, index: number): void {
    SharedService.user.watchlist.removeItem(group, index);
  }

  /**
 * Such efficient, such ugh
 * @param name Item name for the query
 */
  private filter(name: string): Array<Item> {
    return SharedService.itemsUnmapped.filter(i =>
      i.name.toLowerCase().indexOf(name.toLowerCase()) !== -1).slice(0, 20);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
