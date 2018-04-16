import { Component, OnInit } from '@angular/core';
import { UserAuctions, UserAuctionCharacter } from '../../../models/auction/user-auctions';
import { SharedService } from '../../../services/shared.service';
import { Auction } from '../../../models/auction/auction';
import { ColumnDescription } from '../../../models/column-description';
import { Title } from '@angular/platform-browser';
import { AuctionItem } from '../../../models/auction/auction-item';

@Component({
  selector: 'wah-my-auctions',
  templateUrl: './my-auctions.component.html',
  styleUrls: ['./my-auctions.component.scss']
})
export class MyAuctionsComponent implements OnInit {
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  sortAsc: boolean;

  constructor(private _title: Title) {
    this._title.setTitle('WAH - My auctions');
  }

  ngOnInit() {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'quantity', title: 'Stack size', dataType: 'number' });
    this.columns.push({ key: 'buyout', title: 'Buyout', dataType: 'gold' });
    this.columns.push({key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item'});
    this.columns.push({ key: 'bid', title: 'Bid', dataType: 'gold', hideOnMobile: true });
    this.columns.push({key: 'bid', title: 'Bid/item', dataType: 'gold-per-item', hideOnMobile: true});

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

  getUserAuctions(): UserAuctions {
    return SharedService.userAuctions;
  }

  hasUserCharacters(): boolean {
    return SharedService.user.characters.length > 0;
  }

  getUserAuctionsCharacters(): Array<UserAuctionCharacter> {
    return SharedService.userAuctions.characters ? SharedService.userAuctions.characters : [];
  }


  sortUndercut(array: Array<Auction>): void {
    array.sort((a, b) => {
      if (this.sortAsc) {
        return this.getUndercutAmount(b) - this.getUndercutAmount(a);
      } else {
        return this.getUndercutAmount(a) - this.getUndercutAmount(b);
      }
    });
    this.sortAsc = !this.sortAsc;
    
  }

  getUndercutAmount(a: Auction): number {
    return (a.buyout / a.quantity) - SharedService.auctionItemsMap[a.item].buyout;
  }
}
