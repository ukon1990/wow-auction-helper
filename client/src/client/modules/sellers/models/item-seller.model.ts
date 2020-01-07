import {Auction} from '../../auction/models/auction.model';

export class ItemSeller {
  sellerID: string;
  name: string;
  quantity = 1;

  constructor(item: Auction) {
    this.sellerID = `${item.owner}-${item.ownerRealm}`;
    this.name = item.owner;
  }
}
