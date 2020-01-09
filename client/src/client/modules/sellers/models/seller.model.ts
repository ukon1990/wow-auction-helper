import {Auction} from '../../auction/models/auction.model';

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
}
