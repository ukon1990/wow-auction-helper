import {SharedService} from '../../../services/shared.service';
import {Auction} from '../models/auction.model';
import {AuctionItem} from '../models/auction-item.model';
import {CraftingUtil} from '../../crafting/utils/crafting.util';
import {TradeVendors} from '../../../models/trade-vendors';
import {AuctionPet} from '../models/auction-pet.model';
import {ProspectingAndMillingUtil} from '../../../utils/prospect-milling.util';
import {Pet} from '../../pet/models/pet';
import {Report} from '../../../utils/report.util';
import {ProfitSummary} from '../../addon/models/profit-summary.model';
import {TsmService} from '../../tsm/tsm.service';
import {AuctionItemStat} from '../../../../../../api/src/auction/utils/auction-processor.util';

interface OrganizedAuctionResult {
  map: Map<string, AuctionItem>;
  list: AuctionItem[];
  auctions: Auction[];
}

export class AuctionUtil {
  /**
   * Organizes the auctions into groups of auctions per item
   * Used in the auction service.
   * @param auctions A raw auction array
   */
  public static organize(auctions: Auction[]): Promise<OrganizedAuctionResult> {
    return new Promise<OrganizedAuctionResult>((resolve, reject) => {
      const map = new Map<string, AuctionItem>();
      const list: AuctionItem[] = [];
      try {
        const t0 = performance.now();
        this.clearOldData();
        this.groupAuctions(auctions, map, list);
        this.calculateCosts(t0, map);
        SharedService.events.auctionUpdate.emit(true);
        Report.debug('AuctionUtil.organize', list);
        resolve({
          map,
          list,
          auctions
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private static groupAuctions(auctions: Array<Auction>, map: Map<string, AuctionItem>, list: AuctionItem[]) {
    // Add back, if support for classic is added: SharedService.userAuctions.organizeCharacters(SharedService.user.characters);
    TsmService.list.value.forEach(tsm => {
      const auction = new Auction();
      auction.item = +tsm.Id;
      this.addNewAuctionItem(auction, false, '' + auction.item, map, list);
    });

    auctions.forEach((a: Auction) =>
      this.processAuction(a, map, list));

    list.forEach(ai => {
      ai.auctions = ai.auctions.sort((a, b) => {
        return a.buyout / a.quantity - b.buyout / b.quantity;
      });
      const lowest = this.getLowest(ai);
      if (lowest) {
        ai.buyout = lowest.buyout / lowest.quantity;
      }
    });
  }

  private static getLowest(ai: AuctionItem) {
    let lowest = ai.auctions[0];
    for (let i = 0; i < ai.auctions.length; i++) {
      if (ai.auctions[i].buyout > ai.auctions[i].bid) {
        lowest = ai.auctions[i];
        return lowest;
      }
    }
    return lowest;
  }

  private static clearOldData() {
    Object.keys(SharedService.pets)
      .forEach(id => delete SharedService.pets[id].auctions);
  }

  private static calculateCosts(t0, map: Map<string, AuctionItem>) {
    const t1 = performance.now();
    console.log(`Auctions organized in ${t1 - t0} ms`);
    // Trade vendors has to be done before crafting calc
    try {
      TradeVendors.setValues(map);
    } catch (e) {
    }

    CraftingUtil.calculateCost(false, map);

    // ProspectingAndMillingUtil.setCosts();

    ProspectingAndMillingUtil.calculateCost();

    // Dashboard -> Needs to be done after trade vendors
    // Dashboard.addDashboards();

    if (SharedService.user && SharedService.user.shoppingCart) {
      SharedService.user.shoppingCart.calculateCosts();
    }


    const t2 = performance.now();
    console.log(`Prices calc time ${t2 - t1} ms`);
  }

  private static processAuction(a: Auction, map: Map<string, AuctionItem>, list: AuctionItem[]) {
    const id = a.item + AuctionItemStat.bonusId(a.bonusLists, false);
    if (a.petSpeciesId && AuctionUtil.isPetNotInList(a, map)) {
      const petId = AuctionUtil.getPetId(a);
      map.set(petId, this.newAuctionItem(a, true, petId));
      list.push(map.get(petId));
      AuctionUtil.setUserSaleRateForAuction(a);

      if (!AuctionUtil.isPetMissing(a)) {
        this.handlePetAuction(a, petId);
      }
    } else {
      if (a.bonusLists) {
        if (!map.has(id)) {
          this.addNewAuctionItem(a, true, id, map, list);
        } else {
          AuctionUtil.updateAuctionItem(a, id, map);
        }
      }
      if (!map.has(a.item + '')) {
        this.addNewAuctionItem(a, true, '' + a.item, map, list);
      } else {
        AuctionUtil.updateAuctionItem(a, '' + a.item, map);
      }
    }
  }

  private static addNewAuctionItem(a, addAuction = true, id: string, map: Map<string, AuctionItem>, list: AuctionItem[]) {
    map.set(id, this.newAuctionItem(a, addAuction, id));
    list.push(map.get(id));
    AuctionUtil.setUserSaleRateForAuction(a);
  }

  private static handlePetAuction(a: Auction, petId) {
    const pet: Pet = SharedService.pets[a.petSpeciesId];
    if (!pet) {
      return;
    }

    if (!pet.auctions) {
      pet.auctions = new Array<Auction>();
    }

    pet.auctions.push(a);
  }

  static getPetId(a) {
    return `${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`;
  }

  private static isPetNotInList(a, map: Map<string, AuctionItem>) {
    return !map.has(AuctionUtil.getPetId(a));
  }

  private static isPetMissing(auction: Auction) {
    return !SharedService.pets[auction.petSpeciesId];
  }

  private static getItemName(auction: Auction, useSuffix = true): string {
    if (auction.petSpeciesId) {
      if (SharedService.pets[auction.petSpeciesId]) {
        return `${SharedService.pets[auction.petSpeciesId].name} - Level ${auction.petLevel} - Quality ${auction.petQualityId}`;
      }
      return 'Pet name missing';
    }
    let nameSuffix = '';
    let tags = '';
    if (auction.bonusLists && useSuffix) {
      auction.bonusLists.forEach(b => {
        const bonus = SharedService.bonusIdMap[b.bonusListId];
        if (!bonus) {
          return;
        }
        if (bonus.name) {
          nameSuffix = ' ' + bonus.name;
        }

        if (bonus.stats) {
          nameSuffix += `(${
            bonus.stats.replace(/ \[[0-9.]{1,10}\]/gi, '')})`;
        }

        if (bonus.tag) {
          if (!tags) {
            tags = ' Tag: ' + bonus.tag;
          } else {
            tags += ', ' + bonus.tag;
          }
        }
      });
    }
    return SharedService.items[auction.item] ?
      `${SharedService.items[auction.item].name}${nameSuffix}${tags}` :
      'Item name missing';
  }

  private static updateAuctionItem(auction: Auction, auctionItemIdBase: string, map: Map<string, AuctionItem>): void {
    /* TODO: Should this, or should it not be excluded?
    if (auction.buyout === 0) {
      return;
    }*/
    const id = auction.petSpeciesId ?
      new AuctionPet(auction.petSpeciesId, auction.petLevel, auction.petQualityId).auctionId : auctionItemIdBase,
      ai = map.get(id);
    if (!ai.buyout || (ai.buyout > auction.buyout && auction.buyout > 0)) {
      ai.owner = auction.owner;
      ai.buyout = auction.buyout / auction.quantity;
    }

    if (!ai.bid || (ai.bid > auction.bid && auction.bid > 0)) {
      ai.bid = auction.bid / auction.quantity;
    }

    ai.quantityTotal += auction.quantity;
    ai.auctions.push(auction);
  }

  private static newAuctionItem(auction: Auction, addAuction = true, id: string): AuctionItem {
    const tmpAuc = AuctionUtil.getTempAuctionItem(auction, addAuction, id);

    if (TsmService.mapped.value.has(auction.item)) {
      AuctionUtil.setTSMData(auction, tmpAuc);

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

  private static setTSMData(auction: Auction, tmpAuc) {
    const tsmItem = TsmService.mapped.value.get(auction.item);
    tmpAuc.regionSaleRate = tsmItem.RegionSaleRate;
    tmpAuc.mktPrice = tsmItem.MarketValue;
    tmpAuc.avgDailySold = tsmItem.RegionAvgDailySold;
    tmpAuc.regionSaleAvg = tsmItem.RegionSaleAvg;
  }

  private static getTempAuctionItem(auction: Auction, addAuction = true, id: string) {
    const tmpAuc = new AuctionItem();
    tmpAuc.id = id;
    tmpAuc.itemID = auction.item;
    tmpAuc.petSpeciesId = auction.petSpeciesId;
    tmpAuc.petLevel = auction.petLevel;
    tmpAuc.petQualityId = auction.petQualityId;
    tmpAuc.quality = SharedService.items[auction.item] ? SharedService.items[auction.item].quality : 0;
    tmpAuc.name = AuctionUtil.getItemName(auction);

    tmpAuc.itemLevel = SharedService.items[auction.item] ?
      SharedService.items[auction.item].itemLevel : 0;
    this.handleBonusIds(auction, tmpAuc);

    tmpAuc.owner = auction.owner;
    tmpAuc.ownerRealm = auction.ownerRealm;
    tmpAuc.buyout = auction.buyout / auction.quantity;
    tmpAuc.bid = auction.bid / auction.quantity;
    tmpAuc.quantityTotal += auction.quantity;
    tmpAuc.vendorSell = SharedService.items[tmpAuc.itemID] ? SharedService.items[tmpAuc.itemID].sellPrice : 0;
    if (addAuction) {
      tmpAuc.auctions.push(auction);
    }

    return tmpAuc;
  }

  private static handleBonusIds(auction: Auction, tmpAuc: AuctionItem) {
    if (auction.bonusLists) {
      tmpAuc.bonusIds = auction.bonusLists.map(b => b.bonusListId);

      tmpAuc.bonusIds.forEach(b => {
        const bonus = SharedService.bonusIdMap[b];
        if (!bonus) {
          return;
        }
        if (bonus.level) {
          tmpAuc.itemLevel += bonus.level;
        }
        if (bonus.quality) {
          tmpAuc.quality = bonus.quality;
        }
      });
    }
  }
}
