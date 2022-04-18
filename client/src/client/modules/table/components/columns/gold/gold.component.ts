import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../base.component';
import {AuctionItem} from '../../../../auction/models/auction-item.model';
import {AuctionsService} from '../../../../../services/auctions.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {Auction} from '@shared/models';

@Component({
  selector: 'wah-gold',
  templateUrl: './gold.component.html'
})
export class GoldComponent extends BaseComponent implements OnInit {
  auctionItem: AuctionItem;
  private sm = new SubscriptionManager();

  constructor(private service: AuctionsService) {
    super();
  }

  ngOnInit() {
    this.sm.add(this.service.mapped, (map: Map<string, AuctionItem>) =>
      this.auctionItem = map.get(this.getId()));
  }

  private getId(): string {
    if (!this.row) {
      return undefined;
    }
    if (this.idName) {
      return '' + this.row[this.idName];
    }

    if (this.row instanceof Auction) {
      return '' + this.row.item;
    }

    const {id, itemID, itemId} = this.row;
    return '' + (itemID || itemId || id);
  }
}