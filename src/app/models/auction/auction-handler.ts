import { User } from './../user/user';
import { SharedService } from './../../services/shared.service';
import { Auction } from './auction';
import { AuctionItem } from './auction-item';
export class AuctionHandler {
  /**
    * Organizes the auctions into groups of auctions per item
    * Used in the auction service.
    * @param auctions A raw auction array
    */
  public static organize(auctions: Array<Auction>): void {
    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b) => {
      return a.buyout - b.buyout;
    });

    SharedService.auctions = auctions;
    auctions.forEach(a => {
      if (!SharedService.auctionItems[a.item]) {
        SharedService.auctionItems[a.item] = this.auctionToAuctionItem(a);

        if (this.useTSM() && SharedService.tsm[a.item]) {
          const auc = SharedService.auctionItems[a.item],
            tsmItem = SharedService.tsm[a.item];
          auc.mktPrice = tsmItem.MarketValue;
          auc.avgDailySold = tsmItem.RegionAvgDailySold;
          auc.regionSaleAvg = tsmItem.RegionSaleAvg;
          auc.vendorSell = tsmItem.VendorSell;
        }
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

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }
}