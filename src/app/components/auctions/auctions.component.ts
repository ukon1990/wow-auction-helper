import { Component, OnInit, OnDestroy, AfterViewInit, AfterContentInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';
import { FormBuilder, FormGroup } from '@angular/forms';
import { itemClasses } from '../../models/item/item-classes';
import { Subscription } from 'rxjs';
import { Filters } from '../../models/filtering';
import { Title } from '@angular/platform-browser';
import { GameBuild } from '../../utils/game-build.util';
import { itemQuality, itemQualities } from '../../models/item/disenchanting-list';

@Component({
  selector: 'wah-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit, OnDestroy, AfterViewInit,  AfterContentInit {
  form: FormGroup;
  formChanges: Subscription;
  auctionSubscription: Subscription;
  filteredAuctions = [];
  itemClasses = itemClasses;
  itemQualities = itemQualities;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  expansions = GameBuild.expansionMap;
  delayFilter = false;

  constructor(private formBuilder: FormBuilder, private _title: Title) {
    this._title.setTitle('WAH - Auctions');
    const filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;
    this.addColumns();

    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter  ? filter.itemClass : '-1',
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
    this.formChanges = this.form.valueChanges.subscribe((change) => {
      localStorage['query_auctions'] = JSON.stringify(this.form.value);

      if (!this.delayFilter) {
        this.delayFilter = true;
        setTimeout(() => {
            this.filterAuctions();
            this.delayFilter = false;
        }, 100);
      }
    });
    this.auctionSubscription = SharedService.events.auctionUpdate.subscribe(() => {
      this.filterAuctions();
    });
  }

  async ngAfterContentInit() {
    await this.filterAuctions();
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
    this.auctionSubscription.unsubscribe();
  }


  addColumns(): void {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'itemLevel', title: 'iLvL', dataType: 'number' });
    this.columns.push({ key: 'owner', title: 'Owner', dataType: 'seller', hideOnMobile: true});
    this.columns.push({ key: 'quantityTotal', title: 'Stock', dataType: 'number' });
    this.columns.push({ key: 'buyout', title: 'Buyout', dataType: 'gold' });
    this.columns.push({ key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true });

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({ key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true });
      if (SharedService.user.apiToUse === 'tsm') {
        this.columns.push({ key: 'regionSaleAvg', title: 'Avg sale price', dataType: 'gold', hideOnMobile: true});
      } else {
        this.columns.push({ key: 'avgDailyPosted', title: 'Avg daily posted', dataType: 'number', hideOnMobile: true});
      }
      this.columns.push({ key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true });
      this.columns.push({ key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true });
    }
    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true });
  }

  async filterAuctions() {
    this.filteredAuctions = SharedService.auctionItems
      .filter(i => this.isMatch(i));
  }

  isMatch(auctionItem: AuctionItem): boolean {
    return Filters.isNameMatch(auctionItem.itemID, this.form) &&
      Filters.isItemClassMatch(auctionItem.itemID, this.form) &&
      Filters.isSaleRateMatch(auctionItem.itemID, this.form) &&
      Filters.isBelowMarketValue(auctionItem.itemID, this.form) &&
      Filters.isDailySoldMatch(auctionItem.itemID, this.form) &&
      Filters.isBelowVendorPrice(auctionItem.itemID, this.form) &&
      Filters.isItemAboveQuality(auctionItem.itemID, this.form) &&
      Filters.isAboveItemLevel(auctionItem.itemID, this.form)
      && Filters.isExpansionMatch(auctionItem.itemID, this.form.controls.expansion);
  }

  /* istanbul ignore next */
  isUsinAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }

  /* istanbul ignore next */
  isDarkmode(): boolean {
    return SharedService.user ? SharedService.user.isDarkMode : false;
  }
}
