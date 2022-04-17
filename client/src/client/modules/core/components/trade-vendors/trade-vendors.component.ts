import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {TradeVendor, TradeVendorItem} from '../../../../models/item/trade-vendor';
import {ColumnDescription} from '@shared/models';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Filters} from '../../../../utils/filtering';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {TRADE_VENDORS} from '../../../../data/trade-vendors';
import {Zone} from '../../../zone/models/zone.model';
import {ZoneService} from '../../../zone/service/zone.service';
import {ErrorReport} from '../../../../utils/error-report.util';
import {PageEvent} from '@angular/material/paginator';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {ItemService} from '../../../../services/item.service';
import { Item } from '@shared/models';

@Component({
  selector: 'wah-trade-vendors',
  templateUrl: './trade-vendors.component.html',
  styleUrls: ['./trade-vendors.component.scss']
})
export class TradeVendorsComponent implements OnInit, OnDestroy, AfterViewInit {
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  locale = localStorage['locale'].split('-')[0];
  form: FormGroup;
  sm = new SubscriptionManager();
  vendors = TRADE_VENDORS;
  filtered: any[];
  zones: Map<number, Zone> = new Map<number, Zone>();
  itemsPerPage = 8;
  pageRows: Array<number> = [4, 8, 12, 24, 36];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.itemsPerPage, length: 0 };
  private lastCalculationTime: number;


  /* istanbul ignore next */
  get toValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  get fromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  constructor(private formBuilder: FormBuilder, private service: AuctionsService, private zoneService: ZoneService) {
    const filter = JSON.parse(localStorage.getItem('query_trade_vendors')) || undefined;
    this.form = formBuilder.group({
      name: filter && filter.name !== null ?
        filter.name : null,
      /*
      saleRate: filter && filter.saleRate !== null ?
        parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ?
        parseFloat(filter.avgDailySold) : 0,
      */
      onlyBuyableSource: filter && filter.onlyBuyableSource !== null ?
        filter.onlyBuyableSource : false,
      onlyPotentiallyProfitable: filter && filter.onlyPotentiallyProfitable !== null ?
        filter.onlyPotentiallyProfitable : true
    });

  }

  ngOnInit() {
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'value', title: 'Value', dataType: 'gold'});
    this.columns.push({key: 'quantity', title: 'Yield', dataType: 'number', hideOnMobile: true});
    this.columns.push({key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true});
    // this.columns.push({key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true});
    // this.columns.push({key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true});
    this.columns.push({key: 'roi', title: 'ROI', dataType: 'gold'});

    this.sm.add(
      this.form.valueChanges,
      ((change) => {
        const delay = 500;
        this.lastCalculationTime = +new Date();

        setTimeout(() => {
          const timeDiff = +new Date() - this.lastCalculationTime;
          if (timeDiff >= delay) {
            localStorage['query_trade_vendors'] = JSON.stringify(change);
            this.filterVendors(change);
            console.log('vendors', this.vendors);
          }
        }, delay);
      }));
    this.sm.add(
      this.service.mapped,
      () => this.filterVendors(this.form.getRawValue()));

    this.sm.add(this.zoneService.mapped, (map) => {
      this.zones = map;
    });
  }

  ngAfterViewInit(): void {
    this.filterVendors(this.form.getRawValue());
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  select(tv: TradeVendor): void {
    SharedService.events.detailSelection.emit(SharedService.items[tv.itemID]);
  }

  filterVendors(formData): void {
    this.filtered = [];
    const list = [];
    const map = new Map<string, TradeVendor>();
    this.vendors
      .forEach((vendor: TradeVendor) => {
        const id = `${vendor.id}-${vendor.itemID}`;
        if (!map.has(id)) {
          this.filteredTradeVendorItems(vendor, formData);
          if (vendor.itemsFiltered.length) {
            list.push(vendor);
          }
          map.set(id, vendor);
        }
      });
    this.filtered = list.sort((a, b) =>
      this.getAuctionItem(b).buyout - this.getAuctionItem(a).buyout);
  }

  filteredTradeVendorItems(tv: TradeVendor, formData): void {
    try {
      tv.itemsFiltered = this.castTVToArray(tv.items)
        .filter(i =>
          this.isMatch(i, tv, formData));
    } catch (e) {
      ErrorReport.sendError('TradeVendorsComponent.filteredTradeVendorItems', e);
      console.log('Error on', tv.items);
    }
  }

  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

  public castTVToArray(array: any[]) {
    return array.length !== undefined ?
      array : Object.keys(array).map(key => array[key]);
  }

  isMatch(item: TradeVendorItem, vendor: TradeVendor,
          {saleRate, avgDailySold, onlyPotentiallyProfitable, onlyBuyableSource, name}): boolean {
    try {
      const i: Item = ItemService.mapped.value.get(item.itemID);
      return i &&
        this.isNotBOP(vendor, onlyBuyableSource) &&
        this.onlyPotentiallyProfitableMatch(item, vendor, onlyPotentiallyProfitable) &&
        TextUtil.contains(i.name, name);
      /*
        Filters.isSaleRateMatch(item.itemID, saleRate) &&
        Filters.isDailySoldMatch(item.itemID, avgDailySold);
        */
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