import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SharedService} from '../../../../../services/shared.service';
import {itemClasses} from '../../../../../models/item/item-classes';
import {GameBuild} from '../../../../../utils/game-build.util';
import {Filters} from '../../../../../utils/filtering';
import {Item} from '../../../../../models/item/item';
import {ColumnDescription} from '../../../../table/models/column-description';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Report} from '../../../../../utils/report.util';
import {WatchlistGroup} from '../../../models/watchlist-group.model';
import {WatchlistItem} from '../../../models/watchlist-item.model';

@Component({
  selector: 'wah-watchlist-item-batch',
  templateUrl: './watchlist-item-batch.component.html',
  styleUrls: ['./watchlist-item-batch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  subs = new SubscriptionManager();
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
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'itemLevel', title: 'Item level', dataType: 'number'}
  ];

  constructor(private _formBuilder: FormBuilder, private cd: ChangeDetectorRef) {
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
    } catch (error) {
    }
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
      itemClass: -1,
      itemSubClass: -1,
      profession: 'All',
      isSoldByVendor: 2, // TODO: later
      isDroppedByNPCs: 0, // TODO: later
      expansion: null
    });

    this.subs.add(
      this.form.valueChanges,
      (query) => {
        localStorage[this.queryName] = JSON.stringify(query);
      });

    this.subs.add(
      this.itemForm.valueChanges,
      (changes) => {
        this.items.length = 0;
        this.items = SharedService.itemsUnmapped
          .filter(i =>
            this.isMatch(i, changes));
        if (this.cd) {
          this.cd.detectChanges();
        }
      });
  }

  isMatch(item: Item, changes): boolean {
    return Filters.isNameMatch(item.id, changes.name) &&
      Filters.isItemClassMatch(item.id, changes.itemClass, changes.itemSubClass) &&
      Filters.isExpansionMatch(item.id, changes.expansion) &&
      this.isProfessionMatch(item, changes.profession);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  isProfessionMatch(item: Item, profession: string): boolean {
    const recipe = SharedService.itemRecipeMap[item.id],
      validByDefault = profession === null || profession === 'All';
    if (!recipe) {
      return validByDefault ? true : false;
    }
    return validByDefault ||
      profession === recipe[0].profession ||
      !recipe[0].profession && profession === 'none';
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
    Report.send(`Added ${this.items.length} new rules`, 'Watchlist');

    this.close.emit('');
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }

}
