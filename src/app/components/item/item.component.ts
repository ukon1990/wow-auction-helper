import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../models/item/item';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { ColumnDescription } from '../../models/column-description';
import { WowdbService } from '../../services/wowdb.service';

@Component({
  selector: 'wah-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  // TODO: https://github.com/d3/d3 with item price range
  wowDBItem: any;
  columns: Array<ColumnDescription> = [
    {key: 'buyout', title: 'Buyout', dataType: 'gold'},
    {key: 'bid', title: 'Bid', dataType: 'gold'},
    {key: 'quantity', title: 'Size', dataType: ''},
    {key: 'owner', title: 'Owner', dataType: ''}
  ];

  constructor(private _wowDBService: WowdbService) {
  }

  ngOnInit() {
    this._wowDBService.getItem(SharedService.selectedItemId)
      .then(i => this.wowDBItem = i)
      .catch(e => console.error('Could not get the item from WOW DB', e));
  }

  /* istanbul ignore next */
  getAuctionItem(): AuctionItem {
    return SharedService.auctionItemsMap[SharedService.selectedItemId] ?
      SharedService.auctionItemsMap[SharedService.selectedItemId] : undefined;
  }

  /* istanbul ignore next */
  getItem(): Item {
    return SharedService.items[SharedService.selectedItemId] ?
      SharedService.items[SharedService.selectedItemId] : undefined;
  }

  close(): void {
    SharedService.selectedItemId = undefined;
    console.log('closed?');
  }
}
