import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';

@Component({
  selector: 'wah-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss']
})
export class AuctionsComponent implements OnInit {
  columns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'owner', title: 'Owner', dataType: ''},
    {key: 'quantityTotal', title: 'Stock', dataType: 'number'},
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'bid', title: 'Bid', dataType: 'gold'},
    {key: 'mktPrice', title: 'Market value', dataType: 'gold'},
    {key: 'avgDailySold', title: 'Daily sold', dataType: 'number'},
    {key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent'},
    {key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info']}
  ];
  name: string;

  constructor() { }

  ngOnInit() {
  }

  getAuctions(): Array<AuctionItem> {
    return SharedService.auctionItems.filter(i => this.isMatch(i));
  }

  isMatch(auctionItem: AuctionItem): boolean {
    if (!this.name || this.name.length === 0) {
      return true;
    }

    return auctionItem.name
      .toLowerCase()
      .indexOf(
        this.name.toLowerCase()) > -1;
  }

}
