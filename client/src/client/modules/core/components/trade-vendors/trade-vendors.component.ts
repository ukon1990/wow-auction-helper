import {Component, OnDestroy, OnInit} from '@angular/core';
import {TradeVendor, TradeVendorItem} from '../../../../models/item/trade-vendor';
import {ColumnDescription} from '../../../table/models/column-description';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Filters} from '../../../../utils/filtering';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {TRADE_VENDORS} from '../../../../data/trade-vendors';
import {Zone} from '../../../zone/models/zone.model';
import {ZoneService} from '../../../zone/service/zone.service';
import {Item} from '../../../../models/item/item';

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
  zones: Map<number, Zone> = new Map<number, Zone>();

  constructor(private formBuilder: FormBuilder, private service: AuctionsService, private zoneService: ZoneService) {
    const filter = JSON.parse(localStorage.getItem('query_trade_vendors')) || undefined;
    this.form = formBuilder.group({
      name: filter && filter.name !== null ?
        filter.name : null,
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
        this.filterVendors(change);
      }));
    this.sm.add(
      this.service.mapped,
      () => this.filterVendors(this.form.getRawValue()));

    this.sm.add(zoneService.mapped, (map) => {
      this.zones = map;
    });
  }

  ngOnInit() {
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'value', title: 'Value', dataType: 'gold'});
    this.columns.push({key: 'quantity', title: 'Yield', dataType: 'number', hideOnMobile: true});
    this.columns.push({key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true});
    this.columns.push({key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true});
    this.columns.push({key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true});
    this.columns.push({key: 'roi', title: 'ROI', dataType: 'gold'});

    this.filterVendors(this.form.getRawValue());
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  select(tv: TradeVendor): void {
    SharedService.events.detailSelection.emit(SharedService.items[tv.itemID]);
  }

  filterVendors(formData): void {
    this.vendors
      .forEach((vendor: TradeVendor) =>
        this.filteredTradeVendorItems(vendor, formData));
  }

  filteredTradeVendorItems(tv: TradeVendor, formData): void {
    tv.itemsFiltered = tv.items
      .filter(i =>
        this.isMatch(i, tv, formData));
  }

  isMatch(item: TradeVendorItem, vendor: TradeVendor, {saleRate, avgDailySold, onlyPotentiallyProfitable, onlyBuyableSource}): boolean {
    try {
      return this.isNotBOP(vendor, onlyBuyableSource) &&
        this.onlyPotentiallyProfitableMatch(item, vendor, onlyPotentiallyProfitable) &&
        Filters.isSaleRateMatch(item.itemID, saleRate) &&
        Filters.isDailySoldMatch(item.itemID, avgDailySold);
    } catch (e) {
      console.error(e, item);
      return false;
    }
  }

  getAuctionItem(tradeVendor: TradeVendor): AuctionItem {
    return this.service.getById(tradeVendor.itemID) || new AuctionItem();
  }

  private isNotBOP(vendor: TradeVendor, onlyBuyableSource: boolean): boolean {
    const sourceItem: AuctionItem = this.service.getById(vendor.itemID);
    return !onlyBuyableSource ||
      sourceItem !== undefined;
  }

  private onlyPotentiallyProfitableMatch(item: TradeVendorItem, vendor: TradeVendor, onlyPotentiallyProfitable): boolean {
    return !onlyPotentiallyProfitable ||
      this.isCheaperThanSourceFromAH(vendor, item) && onlyPotentiallyProfitable;
  }

  private isCheaperThanSourceFromAH(vendor: TradeVendor, item: TradeVendorItem) {
    return this.getAuctionItem(vendor).buyout < item.value;
  }
}
