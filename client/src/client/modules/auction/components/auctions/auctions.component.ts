import {AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AuctionItem} from '../../models/auction-item.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {FormBuilder, FormGroup} from '@angular/forms';
import {itemClasses} from '../../../../models/item/item-classes';
import {Filters} from '../../../../utils/filtering';
import {Title} from '@angular/platform-browser';
import {GameBuild} from '../../../../utils/game-build.util';
import {itemQualities} from '../../../../models/item/disenchanting-list';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  form: FormGroup;
  itemClasses = itemClasses;
  itemQualities = itemQualities;

  table = {
    columns: [],
    data: []
  };
  expansions = GameBuild.expansionMap;
  delayFilter = false;
  private subs = new SubscriptionManager();

  constructor(private formBuilder: FormBuilder, private _title: Title) {
    SharedService.events.title.next('Auctions');
    const filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;
    this.addColumns();

    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter ? filter.itemClass : '-1',
      itemSubClass: filter ? filter.itemSubClass : '-1',
      mktPrice: filter && filter.mktPrice !== null ? parseFloat(filter.mktPrice) : 0,
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : 0,
      onlyVendorSellable: filter && filter.onlyVendorSellable !== null ? filter.onlyVendorSellable : false,
      expansion: filter && filter.expansion ? filter.expansion : null,
      minItemQuality: filter && filter.minItemQuality ? filter.minItemQuality : null,
      minItemLevel: filter && filter.minItemLevel ? filter.minItemLevel : null
    });
  }

  ngOnInit() {
  }

  async ngAfterViewInit() {
    this.subs.add(
      this.form.valueChanges,
      (() => {
        localStorage['query_auctions'] = JSON.stringify(this.form.value);

        if (!this.delayFilter) {
          this.delayFilter = true;
          setTimeout(() => {
            this.filterAuctions();
            this.delayFilter = false;
          }, 100);
        }
      }));
    this.subs.add(
      SharedService.events.auctionUpdate,
      () => {
        this.filterAuctions();
      });
  }

  async ngAfterContentInit() {
    await this.filterAuctions();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  addColumns(): void {
    const {columns} = this.table;
    columns.push({key: 'name', title: 'Name', dataType: 'name'});
    columns.push({key: 'itemLevel', title: 'iLvL', dataType: 'number', hideOnMobile: true});
    columns.push({key: 'quantityTotal', title: 'Stock', dataType: 'number', hideOnMobile: true});
    columns.push({key: 'buyout', title: 'Buyout', dataType: 'gold'});
    columns.push({key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true});
    columns.push({key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true});
    columns.push({key: 'regionSaleAvg', title: 'Avg sale price', dataType: 'gold', hideOnMobile: true});
    columns.push({key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true});
    columns.push({key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true});
    columns.push({key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true});
  }

  async filterAuctions(changes = this.form.value) {

    this.table.data = SharedService.auctionItems
      .filter(i => this.isMatch(i, changes))
      .map(i => {
        return {...SharedService.pets[i.petSpeciesId], ...i};
      });
  }

  isMatch(auctionItem: AuctionItem, changes): boolean {
    return Filters.isNameMatch(auctionItem.itemID, this.form.getRawValue().name, auctionItem.petSpeciesId) &&
      Filters.isItemClassMatch(
        auctionItem.itemID, this.form.getRawValue().itemClass, changes.itemSubClass) &&
      Filters.isSaleRateMatch(auctionItem.itemID, changes.saleRate) &&
      Filters.isBelowMarketValue(auctionItem.itemID, changes.mktPrice) &&
      Filters.isDailySoldMatch(auctionItem.itemID, changes.avgDailySold) &&
      Filters.isBelowSellToVendorPrice(auctionItem.itemID, changes.onlyVendorSellable) &&
      Filters.isItemAboveQuality(auctionItem.itemID, changes.minItemQuality) &&
      Filters.isAboveItemLevel(auctionItem.itemID, changes.minItemLevel) &&
      Filters.isExpansionMatch(auctionItem.itemID, changes.expansion);
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
