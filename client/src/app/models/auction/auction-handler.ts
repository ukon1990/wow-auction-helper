import {SharedService} from './../../services/shared.service';
import {Auction} from './auction';
import {AuctionItem} from './auction-item';
import {Crafting} from '../crafting/crafting';
import {Dashboard} from '../dashboard';
import {TradeVendors} from '../item/trade-vendors';
import {Seller} from '../seller';
import {AuctionPet} from './auction-pet';
import {WoWUction} from './wowuction';
import {PetsService} from '../../services/pets.service';
import {ProspectingAndMillingUtil} from '../../utils/prospect-milling.util';

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
    console.log('User test', SharedService.userAuctions);

    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b) => {
      return a.buyout / a.quantity - b.buyout / b.quantity;
    });

    SharedService.auctions = auctions;
    auctions.forEach(a => {
      if (a.petSpeciesId && AuctionHandler.isPetNotInList(a)) {
        const petId = AuctionHandler.getPetId(a);
        SharedService.auctionItemsMap[petId] = this.newAuctionItem(a);
        SharedService.auctionItems.push(SharedService.auctionItemsMap[petId]);

        if (AuctionHandler.isPetMissing(a, petService)) {
          console.log('Attempting to add pet');
          petService.getPet(a.petSpeciesId).then(p => {
            AuctionHandler.getItemName(a);
            console.log('Fetched pet', SharedService.pets[a.petSpeciesId]);
          });
        } else {
          if (!AuctionHandler.petHasAuctions(a)) {
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
      SharedService.events.auctionUpdate.emit(true);
    }, 100);
  }

  private static petHasAuctions(a) {
    return SharedService.pets[a.petSpeciesId].auctions;
  }

  private static getPetId(a) {
    return `${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`;
  }

  private static auctionPriceHandler(): AuctionItem {
    return null;
  }

  private static  isPetNotInList(a) {
    return !SharedService.auctionItemsMap[AuctionHandler.getPetId(a)];
  }

  private static  isPetMissing(a, petService: PetsService) {
    return !SharedService.pets[a.petSpeciesId] && petService;
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
    const tmpAuc = AuctionHandler.getTempAuctionItem(auction);

    if (AuctionHandler.useTSM() && SharedService.tsm[auction.item]) {
      AuctionHandler.setTSMData(auction, tmpAuc);

    } else if (AuctionHandler.useWoWUction() && SharedService.wowUction[auction.item]) {
      AuctionHandler.setWowuctionData(auction, tmpAuc);
    }
    return tmpAuc;
  }

  private static setWowuctionData(auction: Auction, tmpAuc) {
    const wowuItem: WoWUction = SharedService.wowUction[auction.item];
    tmpAuc.regionSaleRate = wowuItem.estDemand;
    tmpAuc.mktPrice = wowuItem.mktPrice;
    tmpAuc.avgDailySold = wowuItem.avgDailySold;
    tmpAuc.avgDailyPosted = wowuItem.avgDailyPosted;
  }

  private static setTSMData(auction: Auction, tmpAuc) {
    const tsmItem = SharedService.tsm[auction.item];
    tmpAuc.regionSaleRate = tsmItem.RegionSaleRate;
    tmpAuc.mktPrice = tsmItem.MarketValue;
    tmpAuc.avgDailySold = tsmItem.RegionAvgDailySold;
    tmpAuc.regionSaleAvg = tsmItem.RegionSaleAvg;
  }

  private static getTempAuctionItem(auction: Auction) {
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
    return tmpAuc;
  }

  private static useTSM(): boolean {
    return SharedService.user.apiToUse === 'tsm';
  }

  private static useWoWUction(): boolean {
    return SharedService.user.apiToUse === 'wowuction';
  }
}
