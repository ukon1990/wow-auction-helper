import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Item} from '../../../../models/item/item';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemService} from '../../../../services/item.service';

@Component({
  selector: 'wah-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  auctionItem: AuctionItem;
  item: Item;
  sm = new SubscriptionManager();

  constructor(private auctionService: AuctionsService, private itemService: ItemService) {
    this.sm.add(auctionService.mapped, (map: Map<string, AuctionItem>) => {
      if (map && map.size > 0) {
        this.auctionItem = map.get('171270');
        this.item = this.auctionItem.item;
      }
    });
  }

  ngOnInit(): void {
  }

}
