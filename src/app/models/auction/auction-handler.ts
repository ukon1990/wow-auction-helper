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
    SharedService.auctionItems.length = 0;
    Object.keys(SharedService.auctionItemsMap)
      .forEach(key => {
        delete SharedService.auctionItemsMap[key];
      });

    SharedService.userAuctions.organizeCharacters(SharedService.user.characters);

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
      } else {
        AuctionHandler.updateAuctionItem(a);
      }

      SharedService.userAuctions.addAuction(a, SharedService.auctionItemsMap);
    });

    // Trade vendors has to be done before crafting calc
    TradeVendors.setValues();

    Crafting.calculateCost();

    // Dashboard -> Needs to be done after trade vendors
    Dashboard.addDashboards();
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
    tmpAuc.vendorSell = SharedService.items[tmpAuc.itemID] ? SharedService.items[tmpAuc.itemID].sellPrice : 0;
    tmpAuc.auctions.push(auction);

    if (this.useTSM() && SharedService.tsm[auction.item]) {
      const tsmItem = SharedService.tsm[auction.item];
      tmpAuc.regionSaleRate = tsmItem.RegionSaleRate;
      tmpAuc.mktPrice = tsmItem.MarketValue;
      tmpAuc.avgDailySold = tsmItem.RegionAvgDailySold;
      tmpAuc.regionSaleAvg = tsmItem.RegionSaleAvg;
    }
    return tmpAuc;
  }

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }
}
