import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { WatchlistGroup, WatchlistItem } from '../../../models/watchlist/watchlist';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { Subscription } from 'rxjs';
import { itemClasses } from '../../../models/item/item-classes';
import { GameBuild } from '../../../utils/game-build.util';
import { Filters } from '../../../models/filtering';
import { Item } from '../../../models/item/item';
import { ColumnDescription } from '../../../models/column-description';
import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'wah-watchlist-item-batch',
  templateUrl: './watchlist-item-batch.component.html',
  styleUrls: ['./watchlist-item-batch.component.scss']
})
export class WatchlistItemBatchComponent implements OnInit, OnDestroy {

  @Input() group: WatchlistGroup;
  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;
  itemForm: FormGroup;
  criteria = new Array<string>();
  comparableVariables = SharedService.user.watchlist.COMPARABLE_VARIABLES_LIST;
  targetTypes = new Array<string>();
  groups = new Array<WatchlistGroup>();
  previousCriterias;
  queryName = 'query_dashboard_item';
  formSubscription: Subscription;
  itemFormSubscription: Subscription;
  itemClasses = itemClasses;
  expansions = GameBuild.expansionMap;
  professions = [
    'Blacksmithing',
    'Leatherworking',
    'Alchemy',
    'Cooking',
    'Mining',
    'Tailoring',
    'Engineering',
    'Enchanting',
    'Jewelcrafting',
    'Inscription',
    'none'
  ].sort();
  items: Item[] = [];
  columns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'itemLevel', title: 'Item level', dataType: 'number' }
  ];

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
    try {
      if (localStorage[this.queryName]) {
        this.previousCriterias = JSON.parse(localStorage[this.queryName]);
      }
    } catch (error) {}
    const item = this.previousCriterias ?
      this.previousCriterias : new WatchlistItem(25);
    this.form = this._formBuilder.group({
      compareTo: item.compareTo,
      target: item.target,
      targetType: item.targetType,
      criteria: item.criteria,
      minCraftingProfit: item.minCraftingProfit,
      value: item.value
    });

    this.itemForm = this._formBuilder.group({
      name: '',
      itemClass: '-1',
      itemSubClass: '-1',
      profession: 'All',
      isSoldByVendor: 2, // TODO: later
      isDroppedByNPCs: 0, // TODO: later
      expansion: null
    });

    this.formSubscription = this.form.valueChanges.subscribe((query) => {
      localStorage[this.queryName] = JSON.stringify(query);
    });

    this.itemFormSubscription = this.itemForm.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.items.length = 0;
        this.items = this.items.concat(SharedService.itemsUnmapped.filter(i =>
          this.isMatch(i)));
            console.log(this.items);
      }, 10);
    });
  }

  isMatch(item: Item): boolean {
    return Filters.isNameMatch(item.id, this.itemForm) &&
      Filters.isItemClassMatch(item.id, this.itemForm) &&
      Filters.isExpansionMatch(item.id, this.itemForm.controls.expansion) &&
      this.isProfessionMatch(item);
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.itemFormSubscription.unsubscribe();
  }

  isProfessionMatch(item: Item): boolean {
    const recipe = SharedService.itemRecipeMap[item.id],
      validByDefault = this.itemForm.value.profession === null || this.itemForm.value.profession === 'All';
    if (!recipe) {
      return validByDefault ? true : false;
    }
    return  validByDefault ||
      this.itemForm.value.profession === recipe[0].profession ||
      !recipe[0].profession && this.itemForm.value.profession === 'none';
  }

  add(): void {
    this.items.forEach((item: Item) => {
      const wlItem = new WatchlistItem(item.id);
      wlItem.compareTo = this.form.value.compareTo;
      wlItem.target = this.form.value.target;
      wlItem.targetType = this.form.value.targetType;
      wlItem.criteria = this.form.value.criteria;
      wlItem.minCraftingProfit = this.form.value.minCraftingProfit;
      wlItem.value = this.form.value.value;

      this.group.items.push(wlItem);
    });
    SharedService.user.watchlist.save();
    this.angulartics2.eventTrack.next({
      action: `Added ${ this.items.length } new rules`,
      properties: { category: 'Watchlist' },
    });
    this.close.emit('');
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

}
