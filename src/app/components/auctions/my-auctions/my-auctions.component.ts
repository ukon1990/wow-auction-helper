import { Component, OnInit } from '@angular/core';
import { UserAuctions, UserAuctionCharacter } from '../../../models/auction/user-auctions';
import { SharedService } from '../../../services/shared.service';
import { Auction } from '../../../models/auction/auction';
import { ColumnDescription } from '../../../models/column-description';

@Component({
  selector: 'wah-my-auctions',
  templateUrl: './my-auctions.component.html',
  styleUrls: ['./my-auctions.component.scss']
})
export class MyAuctionsComponent implements OnInit {
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  constructor() { }

  ngOnInit() {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'quantity', title: 'Stack size', dataType: 'number' });
    this.columns.push({ key: 'buyout', title: 'Buyout', dataType: 'gold' });
    this.columns.push({key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'});
    this.columns.push({ key: 'bid', title: 'Bid', dataType: 'gold' });
    this.columns.push({key: 'bid', title: 'Bid/item', dataType: 'gold-per-item'});

    if (SharedService.user.apiToUse === 'tsm') {
      this.columns.push({ key: 'mktPrice', title: 'Market value', dataType: 'gold' });
      this.columns.push({ key: 'avgDailySold', title: 'Daily sold', dataType: 'number' });
      this.columns.push({ key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' });
    }

    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] });
  }

  getUserAuctions(): Array<Auction> {
    return SharedService.userAuctions.auctions;
  }

  getUserAuctionsCharacters(): Array<UserAuctionCharacter> {
    return SharedService.userAuctions.characters ? SharedService.userAuctions.characters : [];
  }
}
