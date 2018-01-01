import { User } from './../user/user';
import { SharedService } from './../../services/shared.service';
import { Auction } from './auction';
import { AuctionItem } from './auction-item';
import { Crafting } from '../crafting/crafting';
import { Dashboard } from '../dashboard';
import { TradeVendors } from '../item/trade-vendors';

export class AuctionHandler {
  /**
    * Organizes the auctions into groups of auctions per item
    * Used in the auction service.
    * @param auctions A raw auction array
    */
  public static organize(auctions: Array<Auction>): void {
    SharedService.userAuctions.organizeCharacters();

    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b) => {
      return a.buyout / a.quantity - b.buyout / b.quantity;
    });

    SharedService.auctions = auctions;
    auctions.forEach(a => {
      if (a.petSpeciesId && !SharedService.auctionItemsMap[`${a.item}-${a.petSpeciesId}`]) {
        SharedService.auctionItemsMap[`${a.item}-${a.petSpeciesId}`] = this.newAuctionItem(a);
        SharedService.auctionItems.push(SharedService.auctionItemsMap[`${a.item}-${a.petSpeciesId}`]);
      } else if (!SharedService.auctionItemsMap[a.item]) {
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

      SharedService.userAuctions.addAuction(a);
    });
    console.log(SharedService.userAuctions);

    Crafting.calculateCost();

    // Dashboard
    Dashboard.addDashboards();

    // Trade vendors
    TradeVendors.setValues();

  }

  private static auctionPriceHandler(): AuctionItem {
    return null;
  }

  private static getItemName(auction: Auction): string {
    if (auction.petSpeciesId) {
      return SharedService.pets[auction.petSpeciesId] ?
        SharedService.pets[auction.petSpeciesId].name : 'Pet name missing';
    }
    return SharedService.items[auction.item] ?
      SharedService.items[auction.item].name : 'Item name missing';
  }

  private static updateAuctionItem(auction: Auction): void {
    /* TODO: Should this, or should it not be excluded?
    if (auction.buyout === 0) {
      return;
    }*/
    const id = auction.petSpeciesId ? `${auction.item}-${auction.petSpeciesId}` : auction.item,
      ai = SharedService.auctionItemsMap[id];
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
    tmpAuc.petSpeciesId = auction.petSpeciesId;
    tmpAuc.name = AuctionHandler.getItemName(auction);
    tmpAuc.owner = auction.owner;
    tmpAuc.buyout = auction.buyout / auction.quantity;
    tmpAuc.bid = auction.bid / auction.quantity;
    tmpAuc.quantityTotal += auction.quantity;
    tmpAuc.auctions.push(auction);
    return tmpAuc;
  }

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }
}
