import { User } from './../user/user';
import { SharedService } from './../../services/shared.service';
import { Auction } from './auction';
import { AuctionItem } from './auction-item';
import { Crafting } from '../crafting/crafting';

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
      if (!SharedService.auctionItemsMap[a.item]) {
        SharedService.auctionItemsMap[a.item] = this.newAuctionItem(a);
        SharedService.auctionItems.push(SharedService.auctionItemsMap[a.item]);

        if (this.useTSM() && SharedService.tsm[a.item]) {
          const auc = SharedService.auctionItemsMap[a.item],
            tsmItem = SharedService.tsm[a.item];
          auc.regionSaleRate = tsmItem.RegionSaleRate;
          auc.mktPrice = tsmItem.MarketValue;
          auc.avgDailySold = tsmItem.RegionAvgDailySold;
          auc.regionSaleAvg = tsmItem.RegionSaleAvg;
          auc.vendorSell = tsmItem.VendorSell;
        }
      } else {
        AuctionHandler.updateAuctionItem(a);
      }
    });
    Crafting.calculateCost();
  }

  private static auctionPriceHandler(): AuctionItem {
    return null;
  }

  private static getItemName(itemID: number): string {
    return SharedService.items[itemID] ?
      SharedService.items[itemID].name : 'Name missing';
  }

  private static updateAuctionItem(auction: Auction): void {
    if (auction.buyout === 0) {
      return;
    }
    const ai = SharedService.auctionItemsMap[auction.item];
    if (ai.buyout === 0 || (ai.buyout > auction.buyout && auction.buyout > 0)) {
      ai.owner = auction.owner;
      ai.buyout = auction.buyout / auction.quantity;
      ai.bid = auction.bid / auction.quantity;
    }
    ai.quantityTotal += auction.quantity;
    ai.auctions.push(auction);
  }

  private static newAuctionItem(auction: Auction): AuctionItem {
    const tmpAuc = new AuctionItem();
    tmpAuc.itemID = auction.item;
    tmpAuc.name = AuctionHandler.getItemName(auction.item);
    tmpAuc.owner = auction.owner;
    tmpAuc.buyout = auction.buyout / auction.quantity;
    tmpAuc.bid = auction.bid / auction.quantity;
    tmpAuc.quantityTotal += auction.quantity;
    return tmpAuc;
  }

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }
}
