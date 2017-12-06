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
    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b)  => {
      return a.buyout - b.buyout;
    });

    SharedService.auctions = auctions;
    auctions.forEach(a => {
      if (!SharedService.auctionItems[a.item]) {
        SharedService.auctionItems[a.item] = this.auctionToAuctionItem(a);
      } else {
        SharedService.auctionItems[a.item].quantityTotal += a.quantity;
        SharedService.auctionItems[a.item].auctions.push(a);
      }
    });
  }

  private static auctionToAuctionItem(auction: Auction): AuctionItem {
    const tmpAuc = new AuctionItem();
    tmpAuc.buyout = auction.buyout;
    tmpAuc.bid = auction.bid;
    tmpAuc.quantityTotal += auction.quantity;
    return tmpAuc;
  }
}
