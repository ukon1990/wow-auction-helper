import {Auction} from '../../auction/models/auction.model';

export class ItemResetBreakpoint {
  constructor(public percent: number, private auctions: Auction[]) {
  }
}
