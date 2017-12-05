import { Auction } from './auction';
import { SharedService } from '../../services/shared.service';

export class AuctionItem {
  itemId: number;
  petSpeciesId: number;
  name = 'Unavailable';
  buyout = 0;
  bid = 0;
  owner: string;
  ownerRealm: string;
  auctions: Auction[];
  estDemand = 0;
  avgDailySold = 0;
  avgDailyPosted = 0;
  regionSaleAvg = 0;
  mktPrice = 0;
  vendorSell = 0;
  quantityTotal = 0;

  constructor() {}

  /**
   * Organizes the auctions into groups of auctions per item
   * Used in the auction service.
   * @param auctions A raw auction array
   */
  public static organize(auctions: Array<Auction>): void {
    // SharedService.auction
  }
}
