import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy} from '@angular/core';
import {WatchlistGroup, WatchlistItem} from '../../../models/watchlist.model';
import {Report} from '../../../../../utils/report.util';
import {SharedService} from '../../../../../services/shared.service';
import {Item} from '../../../../../models/item/item';
import {SelectionItem} from '../../../models/selection-item.model';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PageEvent} from '@angular/material';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';

@Component({
  selector: 'wah-manage-custom-dashboard',
  templateUrl: './manage-custom-dashboard.component.html',
  styleUrls: ['./manage-custom-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageCustomDashboardComponent implements AfterViewInit, OnDestroy {
  @Input() group: WatchlistGroup;
  filteredItems: WatchlistItem[] = [];
  shareString;
  item: WatchlistItem;
  itemSearchForm: FormControl = new FormControl();
  selectedItem: WatchlistItem;
  selectedBatchAdd: string;
  batchEditMode = false;
  batchCount = 0;
  itemSelection: SelectionItem[] = [];
  tsmGroupStrings: Map<string, string> = new Map<string, string>();
  selectedIndex: number;
  pageRows: Array<number> = [9, 12, 15, 18, 21];
  pageEvent: PageEvent = {pageIndex: 0, pageSize: 9, length: 0};
  form: FormGroup;
  sm = new SubscriptionManager();

  constructor(private formBuilder: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.form = formBuilder.group({
      search: new FormControl(''),
      matchSaleRate: new FormControl(null, Validators.required),
      matchDailySold: new FormControl(null, Validators.required),
      hide: new FormControl(false, Validators.required)
    });
  }

  ngAfterViewInit() {
    this.setSelectionItems();
    this.setForm();
    this.sm.add(
      this.form.valueChanges,
      (form) => this.handleFormChange(form));
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private handleFormChange(form) {
    // search is not a relevant change for saving
    let hadChanged = false;
    Object.keys(form).forEach(key => {
      if (key !== 'search') {
        hadChanged = true;
        this.group[key] = form[key];
      } else {
        this.search(form[key]);
      }
    });

    if (hadChanged) {
      this.save();
    }
  }

  private setForm() {
    Object.keys(this.form.getRawValue()).forEach(key => {
      if (this.group[key]) {
        this.form.controls[key].setValue(this.group[key]);
      }
    });
    this.cdRef.detectChanges();
  }

  shareGroup(group: WatchlistGroup): void {
    this.shareString = JSON.stringify({groups: [group]});
  }

  openBachMenu(): void {
    this.selectedBatchAdd = this.group.name;
  }

  add(group: WatchlistGroup, item: Item): void {
    const wlItem = new WatchlistItem(item.id);
    SharedService.user.watchlist.addItem(group, wlItem);
    this.edit(group, wlItem);
    this.itemSearchForm.setValue('');

    Report.send('Added new item', 'Watchlist');

    this.setSelectionItems();
  }

  edit(group: WatchlistGroup, item: WatchlistItem, index?: number): void {
    this.selectedItem = item;

    if (index !== undefined) {
      this.selectedIndex = index;
    }

    Report.send('Edited item', 'Watchlist');
  }

  delete(index: number, isBatchDeleting?: boolean): void {
    SharedService.user.watchlist.removeItem(this.group, index);

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


  setSelectionItems(): void {
    this.batchCount = 0;
    this.itemSelection.length = 0;
    this.group.items.forEach(_ =>
      this.itemSelection.push(new SelectionItem()));
    this.search(this.form.getRawValue().search);
  }

  clearGroup(): void {
    this.group.items.length = 0;
    SharedService.user.watchlist.save();
  }

  getSelectedIndex(index: number): number {
    return this.getFromValue() + index;
  }

  /* istanbul ignore next */
  getFromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  /* istanbul ignore next */
  getToValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }

    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  save(): void {
    // group.items = checked;
    SharedService.user.watchlist.save();
  }

  setSelections(doSelect: boolean, selections: SelectionItem[]): void {
    this.batchCount = 0;
    selections.forEach(s => {
      if (doSelect) {
        this.batchCount++;
      }
      s.isSelected = doSelect;
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

  openBatchEdit(): void {
    this.batchEditMode = true;
  }

  setCountSelectedItems(evt, selections: SelectionItem[]): void {
    this.batchCount = 0;
    selections.forEach(s => {
      if (s.isSelected) {
        this.batchCount++;
      }
    });
  }

  batchDelete(): void {
    this.itemSelection.forEach((selection, index: number) => {
      if (selection.isSelected) {
        this.delete(index, true);
      }
    });
    this.setSelectionItems();
  }

  close(): void {
    this.selectedBatchAdd = undefined;
    this.selectedItem = undefined;
    this.batchEditMode = false;

    this.setTSMGroupString();
    this.setSelectionItems();
  }

  private search(name: string) {
    const previousLength = this.filteredItems.length;
    const results = this.group.items.filter(item =>
      TextUtil.contains(item.name, name));
    this.filteredItems = TextUtil.isEmpty(name) ?
      this.group.items : results;

    if (previousLength !== this.filteredItems.length) {
      this.pageEvent.pageIndex = 0;
      this.cdRef.detectChanges();
    }
  }
}
