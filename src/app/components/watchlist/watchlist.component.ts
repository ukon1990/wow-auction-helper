import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {  } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Angulartics2 } from 'angulartics2';

import { Watchlist, WatchlistItem, WatchlistGroup } from '../../models/watchlist/watchlist';
import { SharedService } from '../../services/shared.service';
import { Recipe } from '../../models/crafting/recipe';
import { Item } from '../../models/item/item';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'wah-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements AfterViewInit {
  itemSearchForm: FormControl = new FormControl();
  filteredItems: Observable<any>;
  selectedItem: WatchlistItem;
  selectedGroup: WatchlistGroup;
  selectedIndex: number;
  selectedBatchAdd: string;
  selectedTabIndex = 1;
  watchlist: Watchlist;
  shareString;
  tsmGroupStrings: Map<string, string> = new Map<string, string>();

  constructor(private angulartics2: Angulartics2, private _title: Title) {
    this._title.setTitle('WAH - Manage dashboards');

    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
      startWith(''),
      map(name => this.filter(name))
      );
  }

  ngAfterViewInit() {
    if (!SharedService.user.watchlist) {
      SharedService.user.watchlist = new Watchlist();
    }
    this.watchlist = SharedService.user.watchlist;

    this.setTSMGroupString();
  }

  tabChange(index: number): void {
    this.selectedTabIndex = index;
    this.shareString = undefined;
  }

  shareGroup(group: WatchlistGroup): void {
    this.shareString = JSON.stringify({ groups: [group]});
  }

  close(): void {
    this.selectedBatchAdd = undefined;
    this.selectedGroup = undefined;
    this.selectedItem = undefined;
    this.selectedIndex = undefined;

    this.setTSMGroupString();
  }

  openBachMenu(group: WatchlistGroup): void {
    this.selectedGroup = group;
    this.selectedBatchAdd = group.name;
  }

  add(group: WatchlistGroup, item: Item): void {
    const wlItem = new WatchlistItem(item.id);
    SharedService.user.watchlist.addItem(group, wlItem);
    this.edit(group, wlItem, SharedService.user.watchlist.groups.length - 1);
    this.itemSearchForm.setValue('');

    this.angulartics2.eventTrack.next({
      action: 'Added new item',
      properties: { category: 'Watchlist' },
    });
  }

  edit(group: WatchlistGroup, item: WatchlistItem, index: number): void {
    this.selectedGroup = group;
    this.selectedItem = item;
    this.selectedIndex = index;

    this.angulartics2.eventTrack.next({
      action: 'Edited item',
      properties: { category: 'Watchlist' },
    });
  }

  delete(group: WatchlistGroup, watchlistItem: WatchlistItem, index: number): void {
    SharedService.user.watchlist.removeItem(group, index);

    this.angulartics2.eventTrack.next({
      action: 'Removed item',
      properties: { category: 'Watchlist' },
    });

    this.setTSMGroupString();
  }

  setTSMGroupString(): void {
    this.tsmGroupStrings.clear();
    SharedService.user.watchlist.groups.forEach(group => {
      // this.tsmGroupStrings.set
      const uniqueItems = new Map<string, number>();
      group.items.forEach(item => {
        uniqueItems[`i:${ item.itemID }`] = item.itemID;
      });
      this.tsmGroupStrings[group.name] = Object.keys(uniqueItems).join(',');
    });
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
