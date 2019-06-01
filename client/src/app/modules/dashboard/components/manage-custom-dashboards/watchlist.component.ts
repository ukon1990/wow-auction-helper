import {Component, AfterViewInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';

import {Watchlist, WatchlistItem, WatchlistGroup} from '../../models/watchlist.model';
import {SharedService} from '../../../../services/shared.service';
import {Item} from '../../../../models/item/item';
import {Title} from '@angular/platform-browser';
import {SelectionItem} from '../../models/selection-item.model';
import {Report} from '../../../../utils/report.util';

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
  selectedTabIndex = 2;
  batchEditMode = false;
  batchCount = 0;
  watchlist: Watchlist;
  itemSelection: Map<string, SelectionItem[]> = new Map<string, SelectionItem[]>();
  shareString;
  tsmGroupStrings: Map<string, string> = new Map<string, string>();

  constructor(private _title: Title) {
    this._title.setTitle('WAH - Manage dashboards');

    this.filteredItems = this.itemSearchForm.valueChanges
      .pipe(
        startWith(''),
        map(name => this.filter(name))
      );
    console.log('WatchlistComponent.contructor');
  }

  ngAfterViewInit() {
    console.log('WatchlistComponent.ngAfterViewInit', SharedService.user, this.watchlist);
    if (!SharedService.user.watchlist) {
      SharedService.user.watchlist = new Watchlist();
    }
    this.watchlist = SharedService.user.watchlist;

    this.setTSMGroupString();
    this.setSelectionItems();
  }

  tabChange(index: number): void {
    this.selectedTabIndex = index;
    this.shareString = undefined;

    this.setTSMGroupString();
    this.setSelectionItems();
  }

  shareGroup(group: WatchlistGroup): void {
    this.shareString = JSON.stringify({groups: [group]});
  }

  close(): void {
    this.selectedBatchAdd = undefined;
    this.selectedGroup = undefined;
    this.selectedItem = undefined;
    this.selectedIndex = undefined;
    this.batchEditMode = false;

    this.setTSMGroupString();
    this.setSelectionItems();
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

    Report.send('Added new item', 'Watchlist');

    this.setSelectionItems();
  }

  edit(group: WatchlistGroup, item: WatchlistItem, index: number): void {
    this.selectedGroup = group;
    this.selectedItem = item;
    this.selectedIndex = index;

    Report.send('Edited item', 'Watchlist');
  }

  delete(group: WatchlistGroup, watchlistItem: WatchlistItem, index: number, isBatchDeleting?: boolean): void {
    SharedService.user.watchlist.removeItem(group, index);

    Report.send('Removed item', 'Watchlist');

    this.setTSMGroupString();
    if (!isBatchDeleting) {
      this.setSelectionItems();
    }
  }

  setTSMGroupString(): void {
    this.tsmGroupStrings.clear();
    SharedService.user.watchlist.groups.forEach(group => {
      // this.tsmGroupStrings.set
      const uniqueItems = new Map<string, number>();
      group.items.forEach(item => {
        uniqueItems[`i:${item.itemID}`] = item.itemID;
      });
      this.tsmGroupStrings[group.name] = Object.keys(uniqueItems).join(',');
    });
  }

  openBatchEdit(group: WatchlistGroup): void {
    this.batchEditMode = true;
    this.selectedGroup = group;
  }

  batchDelete(group: WatchlistGroup): void {
    for (let i = group.items.length - 1; i >= 0; i--) {
      if (this.itemSelection[group.name][i].isSelected) {
        this.delete(group, group.items[i], i, true);
      }
    }
    this.setSelectionItems();
  }

  setCountSelectedItems(evt, selections: SelectionItem[]): void {
    this.batchCount = 0;
    selections.forEach(s => {
      if (s.isSelected) {
        this.batchCount++;
      }
    });
  }

  setSelectionItems(): void {
    this.batchCount = 0;
    this.itemSelection.clear();
    SharedService.user.watchlist.groups.forEach((group: WatchlistGroup) => {
      if (!this.itemSelection[group.name]) {
        this.itemSelection[group.name] = [];
      }
      this.itemSelection[group.name].length = 0;
      group.items.forEach(item =>
        this.itemSelection[group.name].push(new SelectionItem()));
    });
  }

  clearGroup(group: WatchlistGroup): void {
    group.items.length = 0;
    SharedService.user.watchlist.save();
  }

  save(group): void {
    // group.items = checked;
    SharedService.user.watchlist.save();
  }

  setSelections(toSelect: boolean, selections: SelectionItem[]): void {
    this.batchCount = 0;
    selections.forEach(s => {
      if (toSelect) {
        this.batchCount++;
      }
      s.isSelected = toSelect;
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
