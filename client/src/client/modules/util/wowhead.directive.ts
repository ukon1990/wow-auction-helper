import {Directive, HostListener, Input} from '@angular/core';
import {ItemService} from '../../services/item.service';
import {AuctionItem} from '../auction/models/auction-item.model';
import {Item} from '../../models/item/item';
import {Auction} from '../auction/models/auction.model';
import {Pet} from '../pet/models/pet';

@Directive({
  selector: '[wahItemTooltip]'
})
export class WowheadDirective {
  @Input() item: AuctionItem | Item | Auction | Pet;

  constructor(private service: ItemService) {
  }

  @HostListener('mouseenter') getTooltip() {
    /* TODO: Fix custom tooltip
    console.log('Item is', this.item);
    let id, bonusIds;
    if ((this.item as AuctionItem)) {
      id = (this.item as AuctionItem).itemID;

      if ((this.item as AuctionItem).bonusIds) {
        bonusIds = (this.item as AuctionItem).bonusIds;
      }
    }

    if (id) {
      //
      this.service.getTooltip(id, bonusIds)
        .then(console.log)
        .catch(console.error);
    }*/
  }
}
