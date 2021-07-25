import {Component, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Item} from '../../../../models/item/item';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemService} from '../../../../services/item.service';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  readonly column: ColumnDescription = {key: 'name', title: 'Name', dataType: 'name'};
  auctionItem: AuctionItem;
  item: Item;
  sm = new SubscriptionManager();

  constructor(private auctionService: AuctionsService, private itemService: ItemService) {
    this.sm.add(auctionService.mapped, (map: Map<string, AuctionItem>) => {
      if (map && map.size > 0) {
        // Primal shadow: 22456 for statistics
        // Unyielding Girdle: 24255 for tooltip diff
        this.auctionItem = map.get('24255');
        this.item = this.auctionItem.item;
      }
    });
  }

  ngOnInit(): void {
  }

}
