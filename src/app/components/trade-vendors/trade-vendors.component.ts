import { Component, OnInit } from '@angular/core';
import { TradeVendor, TradeVendorItem } from '../../models/item/trade-vendor';
import { TRADE_VENDORS } from '../../models/item/trade-vendors';
import { ColumnDescription } from '../../models/column-description';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { Filters } from '../../models/filtering';
import { FormGroup, FormBuilder } from '../../../../node_modules/@angular/forms';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
  selector: 'wah-trade-vendors',
  templateUrl: './trade-vendors.component.html',
  styleUrls: ['./trade-vendors.component.scss']
})
export class TradeVendorsComponent implements OnInit {
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  locale = localStorage['locale'].split('-')[0];
  form: FormGroup;
  formChanges: Subscription;

  constructor(private formBuilder: FormBuilder) {
    const filter = JSON.parse(localStorage.getItem('query_trade_vendors')) || undefined;
    this.form = formBuilder.group({
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : 0
    });

    this.formChanges = this.form.valueChanges.subscribe((change) => {
      console.log(change);
      localStorage['query_trade_vendors'] = JSON.stringify(change);
    });
  }

  ngOnInit() {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'value', title: 'Value', dataType: 'gold' });
    this.columns.push({ key: 'quantity', title: 'Yield', dataType: 'number' });
    this.columns.push({ key: 'buyout', title: 'Buyout', dataType: 'gold' });

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({ key: 'mktPrice', title: 'Market value', dataType: 'gold' });
      this.columns.push({ key: 'avgDailySold', title: 'Daily sold', dataType: 'number' });
      this.columns.push({ key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' });
    }
    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: [] });
  }

  getTradeVendors(): Array<TradeVendor> {
    return TRADE_VENDORS;
  }

  select(tv: TradeVendor): void {
    SharedService.selectedItemId = tv.itemID;
  }

  filteredTradeVendorItems(tv: TradeVendor): TradeVendorItem[] {
    return tv.items.filter(i => this.isMatch(i));
  }

  isMatch(item: TradeVendorItem): boolean {
    return Filters.isSaleRateMatch(item.itemID, this.form) &&
      Filters.isDailySoldMatch(item.itemID, this.form);
  }

  getAuctionItem(tradeVendor: TradeVendor): AuctionItem {
    return SharedService.auctionItemsMap[tradeVendor.itemID] ?
      SharedService.auctionItemsMap[tradeVendor.itemID] : new AuctionItem();
  }

  /* istanbul ignore next */
  isUsinAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }
}
