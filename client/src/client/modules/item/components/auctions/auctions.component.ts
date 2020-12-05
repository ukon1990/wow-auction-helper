import {Component, Input, OnInit} from '@angular/core';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-item-detail-auctions',
  templateUrl: './auctions.component.html',
})
export class AuctionsComponent implements OnInit {
  @Input() item: AuctionItem;
  private readonly STORAGE_NAME = 'item-details-auctions-tab';
  selectedTabIndex = 0;
  columns: ColumnDescription[] = [
    {key: 'timeLeft', title: 'Time left', dataType: 'time-left'},
    {key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold', hideOnMobile: true},
    {key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'},
    {key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true},
    {key: 'quantity', title: 'Size', dataType: ''}
  ];

  constructor() { }

  ngOnInit(): void {
    const index = localStorage.getItem(this.STORAGE_NAME);
    if (index && this.item.auctions.length > 0) {
      this.selectedTabIndex = +index;
    } else {
      this.selectedTabIndex =  this.item.auctions.length ? 1 : 0;
    }
  }

  setTab(index: number) {
    this.selectedTabIndex = index;
    localStorage.setItem(this.STORAGE_NAME, '' + index);
  }
}
