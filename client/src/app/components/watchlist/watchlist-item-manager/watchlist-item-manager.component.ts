import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { WatchlistItem, WatchlistGroup } from '../../../models/watchlist/watchlist';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { AuctionItem } from '../../../models/auction/auction-item';
import { Angulartics2 } from 'angulartics2';
import { SelectionItem } from '../../../models/watchlist/selection-item.model';

@Component({
  selector: 'wah-watchlist-item-manager',
  templateUrl: './watchlist-item-manager.component.html',
  styleUrls: ['./watchlist-item-manager.component.scss']
})
export class WatchlistItemManagerComponent implements OnInit {

  @Input() item: WatchlistItem;
  @Input() group: WatchlistGroup;
  @Input() selectionList: SelectionItem[];
  @Input() index: number;
  @Input() batchMode: boolean;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;
  criteria = new Array<string>();
  comparableVariables = SharedService.user.watchlist.COMPARABLE_VARIABLES_LIST;
  targetTypes = new Array<string>();
  groups = new Array<WatchlistGroup>();

  constructor(private _formBuilder: FormBuilder, private angulartics2: Angulartics2) {
    Object.keys(SharedService.user.watchlist.CRITERIA).forEach(key => {
      this.criteria.push(SharedService.user.watchlist.CRITERIA[key]);
    });

    Object.keys(SharedService.user.watchlist.TARGET_TYPES).forEach(key => {
      this.targetTypes.push(SharedService.user.watchlist.TARGET_TYPES[key]);
    });

    this.groups = SharedService.user.watchlist.groups;
  }

  ngOnInit() {
    this.form = this._formBuilder.group({
      itemID: this.batchMode ? 0 : this.item.itemID,
      name: this.batchMode ? '' : this.item.name,
      compareTo: this.batchMode ?
        SharedService.user.watchlist.COMPARABLE_VARIABLES.BUYOUT : this.item.compareTo,
      target: this.batchMode ?
        undefined : this.item.target,
      targetType: this.batchMode ? SharedService.user.watchlist.TARGET_TYPES.GOLD : this.item.targetType,
      criteria: this.batchMode ?
        SharedService.user.watchlist.CRITERIA.BELOW : this.item.criteria,
      minCraftingProfit: this.batchMode ? 0 : this.item.minCraftingProfit,
      value: this.batchMode ? 0 : this.item.value,
      group: this.group
    });
  }

  save(): void {
    if (this.item) {
      this.item.compareTo = this.form.value.compareTo;
      this.item.target = this.form.value.target;
      this.item.targetType = this.form.value.targetType;
      this.item.criteria = this.form.value.criteria;
      this.item.minCraftingProfit = this.form.value.minCraftingProfit;
      this.item.value = this.form.value.value;

      if (this.group !== this.form.value.group) {
        SharedService.user.watchlist.moveItem(this.group, this.form.value.group, this.index);
      }
    } else {
      for (let i = this.selectionList.length - 1; i >= 0; i--) {
        if (this.selectionList[i].isSelected) {
          this.group.items[i].compareTo = this.form.value.compareTo;
          this.group.items[i].target = this.form.value.target;
          this.group.items[i].targetType = this.form.value.targetType;
          this.group.items[i].criteria = this.form.value.criteria;
          this.group.items[i].minCraftingProfit = this.form.value.minCraftingProfit;
          this.group.items[i].value = this.form.value.value;

          if (this.group !== this.form.value.group) {
            SharedService.user.watchlist.moveItem(this.group, this.form.value.group, i);
          }
        }
      }
    }

    console.log(this.item, this.form.value);
    SharedService.user.watchlist.save();
    this.close.emit('');
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  getAuctionItem(): boolean {
    return this.item && SharedService.auctionItemsMap[this.item.itemID] ?
      SharedService.auctionItemsMap[this.item.itemID] : undefined;
  }

  getTSMString(): any {
    return SharedService.user.watchlist.getTSMStringValues({
      itemID: this.item.itemID,
      name: this.item.name,
      compareTo: this.form.value.compareTo,
      target: this.form.value.target,
      targetType: this.form.value.targetType,
      criteria: this.form.value.criteria,
      minCraftingProfit: this.form.value.minCraftingProfit,
      value: this.form.value.value
    });
  }
}
