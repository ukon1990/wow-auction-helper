import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';
import { FormBuilder, FormGroup } from '@angular/forms';
import { itemClasses } from '../../models/item/item-classes';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'wah-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  formChanges: Subscription;
  itemClasses = itemClasses;
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'owner', title: 'Owner', dataType: '' },
    { key: 'quantityTotal', title: 'Stock', dataType: 'number' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: 'bid', title: 'Bid', dataType: 'gold' },
    { key: 'mktPrice', title: 'Market value', dataType: 'gold' },
    { key: 'avgDailySold', title: 'Daily sold', dataType: 'number' },
    { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
  ];

  constructor(private formBuilder: FormBuilder) {
    const filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;

    this.form = formBuilder.group({
      name: filter && filter.name ? filter.name : '',
      itemClass: filter  ? filter.itemClass : -1,
      itemSubClass: filter ? filter.itemSubClass : -1,
      mktPrice: filter && filter.mktPrice !== null ? parseFloat(filter.mktPrice) : 0,
      saleRate: filter && filter.saleRate !== null ? parseFloat(filter.saleRate) : 0,
      avgDailySold: filter && filter.avgDailySold !== null ? parseFloat(filter.avgDailySold) : 0,
      onlyVendorSellable: filter && filter.onlyVendorSellable !== null ? filter.onlyVendorSellable : false
    });
  }

  ngOnInit() {
    this.formChanges = this.form.valueChanges.subscribe((change) => {


      localStorage['query_auctions'] = JSON.stringify(this.form.value);
    });
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  getAuctions(): Array<AuctionItem> {
    return SharedService.auctionItems.filter(i => this.isMatch(i));
  }

  isMatch(auctionItem: AuctionItem): boolean {
    return this.isNameMatch(auctionItem) &&
      this.isItemClassMatch(auctionItem) &&
      this.isSaleRateMatch(auctionItem) &&
      this.isBelowMarketValue(auctionItem) &&
      this.isDailySoldMatch(auctionItem);
  }

  isNameMatch(auctionItem: AuctionItem): boolean {
    if (this.form.value.name === null) {
      return true;
    }
    return auctionItem.name.toLowerCase().indexOf(this.form.value.name.toLowerCase()) > -1;
  }

  isBelowMarketValue(auctionItem: AuctionItem): boolean {
    if (this.form.value.mktPrice === null || this.form.value.mktPrice === 0) {
      return true;
    } else if (auctionItem.mktPrice === 0) {
      return false;
    }
    return Math.round((auctionItem.buyout / auctionItem.mktPrice) * 100) <= this.form.value.mktPrice;
  }

  isSaleRateMatch(auctionItem: AuctionItem): boolean {
    if (this.form.value.saleRate && this.form.value.saleRate > 0) {
      return auctionItem.regionSaleRate >= this.form.value.saleRate / 100;
    }
    return true;
  }

  isDailySoldMatch(auctionItem: AuctionItem): boolean {
    if (this.form.value.avgDailySold && this.form.value.avgDailySold > 0) {
      return auctionItem.avgDailySold >= this.form.value.avgDailySold;
    }
    return true;
  }

  isItemClassMatch(auctionItem: AuctionItem): boolean {
    const itemClass = SharedService.items[auctionItem.itemID] ? SharedService.items[auctionItem.itemID].itemClass : -1;

    if (this.form.value.itemClass === null || this.form.value.itemClass === '-1') {
      return true;
    } else if (itemClasses.classes[this.form.value.itemClass] &&
        parseInt(itemClass, 10) === itemClasses.classes[this.form.value.itemClass].class) {
      return this.isItemSubclassMatch(auctionItem, itemClasses.classes[this.form.value.itemClass]);
    }
    return false;
  }

  isItemSubclassMatch(auctionItem: AuctionItem, subClasses: any): boolean {
    const subClass = SharedService.items[auctionItem.itemID] ? SharedService.items[auctionItem.itemID].itemSubClass : -1;

    if (this.form.value.itemSubClass === null || this.form.value.itemSubClass === '-1' || this.form.value.itemSubClass === undefined) {
      return true;
    } else {
      return subClass > -1 ?
        subClasses.subclasses[this.form.value.itemSubClass].subclass === parseInt(subClass, 10) : false;
    }
  }

  isUsinAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }
}
