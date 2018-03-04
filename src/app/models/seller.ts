import { Auction } from './auction/auction';
import { SharedService } from '../services/shared.service';

export class Seller {
  name: string;
  realm: string;
  liquidity: number;
  volume: number;
  numOfAuctions = 1;
  auctions: Array<Auction> = new Array<Auction>();

  constructor(name: string, realm: string, liquidity: number, volume: number, auction: Auction) {
    this.name = name;
    this.realm = realm;
    this.liquidity = liquidity;
    this.volume = volume;
    this.auctions.push(auction);
  }

  public static organize(): void {
    Object.keys(SharedService.sellersMap)
    .forEach(key => {
      delete SharedService.sellersMap[key];
    });
    SharedService.sellers.length = 0;

    SharedService.auctions.forEach(a => {
      if (!SharedService.sellersMap[a.owner]) {
        SharedService.sellersMap[a.owner] = new Seller(a.owner, a.ownerRealm, a.buyout, a.quantity, a);
        SharedService.sellers.push(SharedService.sellersMap[a.owner]);
      } else {
        SharedService.sellersMap[a.owner].liquidity += a.buyout;
        SharedService.sellersMap[a.owner].volume += a.quantity;
        SharedService.sellersMap[a.owner].numOfAuctions++;
        SharedService.sellersMap[a.owner].auctions.push(a);
      }
    });
  }
}
