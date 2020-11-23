import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Item} from '../../../../models/item/item';

@Component({
  selector: 'wah-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  auctionItem: AuctionItem;
  item: Item;
  sm = new SubscriptionManager();

  constructor() {
  }

  ngOnInit(): void {
  }

}
