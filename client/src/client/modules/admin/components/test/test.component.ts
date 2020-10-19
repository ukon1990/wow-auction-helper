import {Component, OnInit} from '@angular/core';
import {ItemService} from '../../../../services/item.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Item} from '../../../../models/item/item';
import {AuctionsService} from '../../../../services/auctions.service';

@Component({
  selector: 'wah-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  auctionItem: AuctionItem;
  item: Item;
  sm = new SubscriptionManager();

  constructor(private auctionService: AuctionsService) {
    this.sm.add(ItemService.mapped, map => this.item = map.get(168487));
    this.sm.add(auctionService.mapped, map => this.auctionItem = map.get('168487'));
  }

  ngOnInit(): void {
  }

}
