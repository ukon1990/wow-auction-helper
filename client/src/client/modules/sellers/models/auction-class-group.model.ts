import {Auction} from '../../auction/models/auction.model';
import {Item} from '../../../models/item/item';

export class AuctionClassGroup {
  itemClass: number;
  itemSubClass: number;
  name = '';
  auctions: Array<Auction> = new Array<Auction>();
  quantity = 1;

  constructor(item: Item) {
    this.itemClass = item.itemClass;
    this.itemSubClass = item.itemSubClass;
  }
}
