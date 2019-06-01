import {SharedService} from './../../services/shared.service';
import {Auction} from './auction';
import {AuctionItem} from './auction-item';
import {Crafting} from '../crafting/crafting';
import {Dashboard} from '../../modules/dashboard/models/dashboard.model';
import {TradeVendors} from '../item/trade-vendors';
import {Seller} from '../seller';
import {AuctionPet} from './auction-pet';
import {WoWUction} from './wowuction';
import {PetsService} from '../../services/pets.service';
import {ProspectingAndMillingUtil} from '../../utils/prospect-milling.util';
import {ProfitSummary} from '../../utils/tsm-lua.util';
import {Pet} from '../pet';

export class AuctionHandler {
  /**
   * Organizes the auctions into groups of auctions per item
   * Used in the auction service.
   * @param auctions A raw auction array
   */
  public static organize(auctions: Array<Auction>, petService?: PetsService): Promise<any> {
    return new Promise<AuctionItem[]>((resolve, reject) => {
      try {
        const t0 = performance.now();
        this.clearOldData();
        this.groupAuctions(auctions, petService);
        this.calculateCosts(t0);
        SharedService.events.auctionUpdate.emit(true);
        resolve(SharedService.auctionItems);
      } catch (e) {
        reject(e);
      }
    });
  }

  private static groupAuctions(auctions: Array<Auction>, petService: PetsService) {
    SharedService.userAuctions.organizeCharacters(SharedService.user.characters);

    // Sorting by buyout, before we do the grouping for less processing.
    auctions.sort((a, b) => {
      return a.buyout / a.quantity - b.buyout / b.quantity;
    });

    SharedService.auctions = auctions;
    auctions.forEach((a: Auction) =>
      this.processAuction(a, petService));

    // Checking if we have been undercutted etc
    SharedService.userAuctions
      .countUndercuttedAuctions(SharedService.auctionItemsMap);
  }

  private static clearOldData() {
    SharedService.auctionItems.length = 0;
    Object.keys(SharedService.auctionItemsMap).forEach(id =>
      delete SharedService.auctionItemsMap[id]);
    Seller.clearSellers();
  }

  private static calculateCosts(t0) {
    const t1 = performance.now();
    console.log(`Auctions organized in ${t1 - t0} ms`);
    // Trade vendors has to be done before crafting calc
    TradeVendors.setValues();

    Crafting.calculateCost();

    // Grouping auctions by seller
    Seller.setItemClasses();

    // ProspectingAndMillingUtil.setCosts();

    ProspectingAndMillingUtil.calculateCost();

    // Dashboard -> Needs to be done after trade vendors
    Dashboard.addDashboards();

    SharedService.user.shoppingCart.calculateCosts();


    const t2 = performance.now();
    console.log(`Prices calc time ${t2 - t1} ms`);
  }

  private static processAuction(a, petService: PetsService) {
    if (a.petSpeciesId && AuctionHandler.isPetNotInList(a)) {
      const petId = AuctionHandler.getPetId(a);
      SharedService.auctionItemsMap[petId] = this.newAuctionItem(a);
      SharedService.auctionItems.push(SharedService.auctionItemsMap[petId]);
      AuctionHandler.setUserSaleRateForAuction(a);

      if (AuctionHandler.isPetMissing(a, petService)) {
        /* TODO: Make this less annoying
        console.log('Attempting to add pet');
        petService.getPet(a.petSpeciesId).then(p => {
          AuctionHandler.getItemName(a);
          // console.log('Fetched pet', SharedService.pets[a.petSpeciesId]);
        });*/
      } else {
        this.handlePetAuction(a, petId);
      }
    } else if (!SharedService.auctionItemsMap[a.item]) {
      SharedService.auctionItemsMap[a.item] = this.newAuctionItem(a);
      SharedService.auctionItems.push(SharedService.auctionItemsMap[a.item]);
      AuctionHandler.setUserSaleRateForAuction(a);
    } else {
      AuctionHandler.updateAuctionItem(a);
    }

    SharedService.userAuctions.addAuction(
      a, SharedService.auctionItemsMap[Auction.getAuctionItemId(a)]);

    Seller.setSellerData(a);
  }

  private static handlePetAuction(a: Auction, petId) {
    const pet: Pet = SharedService.pets[a.petSpeciesId];
    if (!pet) {
      console.log(`Missing pet ${a.petSpeciesId}`,
        SharedService.pets[a.petSpeciesId]);
      return;
    }

    if (!pet.auctions) {
      SharedService.pets[a.petSpeciesId].auctions = new Array<AuctionItem>();
    }

    SharedService.pets[a.petSpeciesId]
      .auctions.push(SharedService.auctionItemsMap[petId]);
  }

  private static getPetId(a) {
    return `${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`;
  }

  private static isPetNotInList(a) {
    return !SharedService.auctionItemsMap[AuctionHandler.getPetId(a)];
  }

  private static isPetMissing(a, petService: PetsService) {
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

  private static setUserSaleRateForAuction(auction: Auction) {
    const profitSummaryMain = SharedService.tsmAddonData.profitSummary;
    if (!profitSummaryMain || !SharedService.realms) {
      return;
    }
    const profitSummary: ProfitSummary = profitSummaryMain[SharedService.realms[SharedService.user.realm].name];
    if (profitSummary) {
      profitSummary.setSaleRateForItem(auction.item);
    }
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
