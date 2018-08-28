import { User } from './../user/user';
import { SharedService } from './../../services/shared.service';
import { Auction } from './auction';
import { AuctionItem } from './auction-item';
import { Crafting } from '../crafting/crafting';
import { Dashboard } from '../dashboard';
import { TradeVendors } from '../item/trade-vendors';
import { Seller } from '../seller';
import { AuctionPet } from './auction-pet';
import { Notifications } from '../user/notification';
import { WoWUction } from './wowuction';
import { PetsService } from '../../services/pets.service';
import { ProspectingAndMillingUtil } from '../../utils/prospect-milling.util';

export class AuctionHandler {
  /**
    * Organizes the auctions into groups of auctions per item
    * Used in the auction service.
    * @param auctions A raw auction array
    */
  public static organize(auctions: Array<Auction>, petService?: PetsService): void {
    const t0 = performance.now();
    SharedService.auctionItems.length = 0;
    Object.keys(SharedService.auctionItemsMap).forEach(id =>
      delete SharedService.auctionItemsMap[id]);
    Seller.clearSellers();

    SharedService.userAuctions.organizeCharacters(SharedService.user.characters);

    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b) => {
      return a.buyout / a.quantity - b.buyout / b.quantity;
    });

    SharedService.auctions = auctions;
    console.log(SharedService.auctions);
    auctions.forEach(a => {
      if (a.petSpeciesId && !SharedService.auctionItemsMap[`${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`]) {
        const petId = `${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`;
        SharedService.auctionItemsMap[petId] = this.newAuctionItem(a);
        SharedService.auctionItems.push(SharedService.auctionItemsMap[petId]);

        if (!SharedService.pets[a.petSpeciesId] && petService) {
          console.log('Attempting to add pet');
          petService.getPet(a.petSpeciesId).then(p => {
            AuctionHandler.getItemName(a);
            console.log('Fetched pet', SharedService.pets[a.petSpeciesId]);
          });
        } else {
          if (!SharedService.pets[a.petSpeciesId].auctions) {
            SharedService.pets[a.petSpeciesId].auctions = new Array<AuctionItem>();
          }
          SharedService.pets[a.petSpeciesId].auctions.push(SharedService.auctionItemsMap[petId]);
        }
      } else if (!SharedService.auctionItemsMap[a.item]) {
        SharedService.auctionItemsMap[a.item] = this.newAuctionItem(a);
        SharedService.auctionItems.push(SharedService.auctionItemsMap[a.item]);
      } else {
        AuctionHandler.updateAuctionItem(a);
      }

      SharedService.userAuctions.addAuction(
        a, SharedService.auctionItemsMap[Auction.getAuctionItemId(a)]);

      Seller.setSellerData(a);

    });
    console.log(SharedService.auctionItems, SharedService.auctionItemsMap);

    // Checking if we have been undercutted etc
    SharedService.userAuctions.countUndercuttedAuctions(SharedService.auctionItemsMap);

    const t1 = performance.now();
    console.log(`Auctions organized in ${ t1 - t0 } ms`);
    setTimeout(() => {

      // Trade vendors has to be done before crafting calc
      TradeVendors.setValues();

      Crafting.calculateCost();

      // Grouping auctions by seller
      Seller.setItemClasses();

      // ProspectingAndMillingUtil.setCosts();

      ProspectingAndMillingUtil.calculateCost();

      // Dashboard -> Needs to be done after trade vendors
      Dashboard.addDashboards();

      SharedService.user.shoppingCart.restore();
      SharedService.user.shoppingCart.calculateCartCost();


      const t2 = performance.now();
      console.log(`Prices calc time ${ t2 - t1 } ms`);
    }, 100);
  }

  private static auctionPriceHandler(): AuctionItem {
    return null;
  }

  private static getItemName(auction: Auction): string {
    if (auction.petSpeciesId) {
      if (SharedService.pets[auction.petSpeciesId]) {
        return `${SharedService.pets[auction.petSpeciesId].name} - Level ${auction.petLevel} - Quality ${auction.petQualityId}`;
      }
      return 'Pet name missing';
    }
    return SharedService.items[auction.item] ?
      SharedService.items[auction.item].name : 'Item name missing';
  }

  private static updateAuctionItem(auction: Auction): void {
    /* TODO: Should this, or should it not be excluded?
    if (auction.buyout === 0) {
      return;
    }*/
    const id = auction.petSpeciesId ?
      new AuctionPet(auction.petSpeciesId, auction.petLevel, auction.petQualityId).auctionId : auction.item,
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
    tmpAuc.petLevel = auction.petLevel;
    tmpAuc.petQualityId = auction.petQualityId;
    tmpAuc.name = AuctionHandler.getItemName(auction);
    tmpAuc.itemLevel = SharedService.items[auction.item] ?
      SharedService.items[auction.item].itemLevel : 0;
    tmpAuc.owner = auction.owner;
    tmpAuc.ownerRealm = auction.ownerRealm;
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

    } else if (this.useWoWUction() && SharedService.wowUction[auction.item]) {
      const wowuItem: WoWUction = SharedService.wowUction[auction.item];
      tmpAuc.regionSaleRate = wowuItem.estDemand;
      tmpAuc.mktPrice = wowuItem.mktPrice;
      tmpAuc.avgDailySold = wowuItem.avgDailySold;
      tmpAuc.avgDailyPosted = wowuItem.avgDailyPosted;
    }
    return tmpAuc;
  }

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  private static useWoWUction(): boolean {
    return SharedService.user.apiToUse === 'wowuction';
  }
}
