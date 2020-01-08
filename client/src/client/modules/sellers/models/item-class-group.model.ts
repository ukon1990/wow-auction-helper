import {Auction} from '../../auction/models/auction.model';
import {SharedService} from '../../../services/shared.service';
import {Seller} from './seller.model';

/**
 * Bad practice. but it will remain here until I come up with a better way of solving this without having to iterate over the auctions again
 */
export class ItemClassGroup {
  id: number;
  name = '';
  sellersMap = new Map<string, Seller>();
  sellers = new Array<Seller>();
  auctions = new Array<Auction>();

  constructor(auction: Auction) {
    this.id = SharedService.items[auction.item].itemClass;
    this.add(auction);
  }

  add(auction: Auction) {
    if (!this.sellersMap[auction.owner]) {
      this.sellersMap[auction.owner] = new Seller(auction.owner, auction.ownerRealm, auction.buyout, auction.quantity, auction);
      this.sellers.push(this.sellersMap[auction.owner]);
    } else {
      this.sellersMap[auction.owner].liquidity += auction.buyout;
      this.sellersMap[auction.owner].volume += auction.quantity;
      this.sellersMap[auction.owner].numOfAuctions++;
      this.sellersMap[auction.owner].auctions.push(auction);
    }
  }
}
