import {Component, OnDestroy, OnInit} from '@angular/core';
import {TradeVendor, TradeVendorItem} from '../../../../models/item/trade-vendor';
import {TRADE_VENDORS} from '../../../../models/item/trade-vendors';
import {ColumnDescription} from '../../../table/models/column-description';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Filters} from '../../../../utils/filtering';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';

@Component({
  selector: 'wah-trade-vendors',
  templateUrl: './trade-vendors.component.html',
  styleUrls: ['./trade-vendors.component.scss']
})
export class TradeVendorsComponent implements OnInit, OnDestroy {
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  locale = localStorage['locale'].split('-')[0];
  form: FormGroup;
  sm = new SubscriptionManager();
  vendors = TRADE_VENDORS;

  constructor(private formBuilder: FormBuilder, private service: AuctionsService) {
    SharedService.events.title.next('Trade vendors');
    const filter = JSON.parse(localStorage.getItem('query_trade_vendors')) || undefined;
    this.form = formBuilder.group({
      saleRate: filter && filter.saleRate !== null ?
        parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ?
        parseFloat(filter.avgDailySold) : 0,
      onlyBuyableSource: filter && filter.onlyBuyableSource !== null ?
        filter.onlyBuyableSource : false,
      onlyPotentiallyProfitable: filter && filter.onlyPotentiallyProfitable !== null ?
        filter.onlyPotentiallyProfitable : false
    });

    this.sm.add(
      this.form.valueChanges,
      ((change) => {
        localStorage['query_trade_vendors'] = JSON.stringify(change);
        this.filterVendors();
      }));
    this.sm.add(
      this.service.events.groupedList,
      () => this.filterVendors());
  }

  ngOnInit() {
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'value', title: 'Value', dataType: 'gold'});
    this.columns.push({key: 'quantity', title: 'Yield', dataType: 'number'});
    this.columns.push({key: 'buyout', title: 'Buyout', dataType: 'gold'});

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({key: 'mktPrice', title: 'Market value', dataType: 'gold'});
      this.columns.push({key: 'avgDailySold', title: 'Daily sold', dataType: 'number'});
      this.columns.push({key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'});
    }

    this.filterVendors();
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  select(tv: TradeVendor): void {
    SharedService.selectedItemId = tv.itemID;
  }

  filterVendors(): void {
    this.vendors
      .forEach((vendor: TradeVendor) =>
        this.filteredTradeVendorItems(vendor));
  }

  filteredTradeVendorItems(tv: TradeVendor): void {
    tv.itemsFiltered = tv.items
      .filter(i =>
        this.isMatch(i, tv));
  }

  isMatch(item: TradeVendorItem, vendor: TradeVendor): boolean {
    try {
      return this.isOnlyBuyableSourceMatch(vendor) &&
        this.onlyPotentiallyProfitableMatch(item, vendor) &&
        Filters.isSaleRateMatch(item.itemID, this.form.getRawValue().saleRate) &&
        Filters.isDailySoldMatch(item.itemID, this.form.getRawValue().avgDailySold);
    } catch (e) {
      console.error(e, item);
      return false;
    }
  }

  getAuctionItem(tradeVendor: TradeVendor): AuctionItem {
    return SharedService.auctionItemsMap[tradeVendor.itemID] ?
      SharedService.auctionItemsMap[tradeVendor.itemID] : new AuctionItem();
  }

  /* istanbul ignore next */
  isUsinAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }

  private isOnlyBuyableSourceMatch(vendor: TradeVendor): boolean {
    return !this.form.getRawValue().onlyBuyableSource ||
      !vendor.useForCrafting &&
      this.form.getRawValue().onlyBuyableSource;
  }

  private onlyPotentiallyProfitableMatch(item: TradeVendorItem, vendor: TradeVendor): boolean {
    return !this.form.getRawValue().onlyPotentiallyProfitable ||
      this.isCheaperThanSourceFromAH(vendor, item) &&
      this.form.getRawValue().onlyPotentiallyProfitable;
  }

  private isCheaperThanSourceFromAH(vendor: TradeVendor, item: TradeVendorItem) {
    return this.getAuctionItem(vendor).buyout < item.value;
  }
}
