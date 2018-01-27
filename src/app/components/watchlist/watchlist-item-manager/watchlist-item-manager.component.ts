import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { WatchlistItem, WatchlistGroup } from '../../../models/watchlist/watchlist';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { AuctionItem } from '../../../models/auction/auction-item';

@Component({
  selector: 'wah-watchlist-item-manager',
  templateUrl: './watchlist-item-manager.component.html',
  styleUrls: ['./watchlist-item-manager.component.scss']
})
export class WatchlistItemManagerComponent implements OnInit {

  @Input() item: WatchlistItem;
  @Input() group: WatchlistGroup;
  @Input() index: number;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;
  criteria = new Array<string>();
  comparableVariables = new Array<string>();
  targetTypes = new Array<string>();
  groups = new Array<WatchlistGroup>();

  constructor(private _formBuilder: FormBuilder) {
    Object.keys(SharedService.user.watchlist.CRITERIA).forEach(key => {
      this.criteria.push(SharedService.user.watchlist.CRITERIA[key]);
    });

    Object.keys(SharedService.user.watchlist.COMPARABLE_VARIABLES).forEach(key => {
      this.comparableVariables.push(SharedService.user.watchlist.COMPARABLE_VARIABLES[key]);
    });

    Object.keys(SharedService.user.watchlist.TARGET_TYPES).forEach(key => {
      this.targetTypes.push(SharedService.user.watchlist.TARGET_TYPES[key]);
    });

    this.groups = SharedService.user.watchlist.groups;
  }

  ngOnInit() {
    this.form = this._formBuilder.group({
      itemID: this.item.itemID,
      name: this.item.name,
      compareTo: this.item.compareTo,
      target: this.item.target,
      targetType: this.item.targetType,
      criteria: this.item.criteria,
      minCraftingProfit: this.item.minCraftingProfit,
      value: this.item.value,
      group: this.group
    });
  }

  save(): void {
    this.item.compareTo = this.form.value.compareTo;
    this.item.target = this.form.value.target;
    this.item.targetType = this.form.value.targetType;
    this.item.criteria = this.form.value.criteria;
    this.item.minCraftingProfit = this.form.value.minCraftingProfit;
    this.item.value = this.form.value.value;

    console.log(this.item, this.form.value);
    if (this.group !== this.form.value.group) {
      SharedService.user.watchlist.moveItem(this.group, this.form.value.group, this.index);
    }
    SharedService.user.watchlist.save();
    this.close.emit('');
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

  getAuctionItem(): boolean {
    return SharedService.auctionItemsMap[this.item.itemID] ?
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
