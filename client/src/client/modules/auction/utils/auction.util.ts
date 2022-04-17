import {SharedService} from '../../../services/shared.service';
import {Auction, ItemStats, Pet} from '@shared/models';
import {AuctionItem} from '../models/auction-item.model';
import {TradeVendors} from '../../../models/trade-vendors';
import {AuctionPet} from '../models/auction-pet.model';
import {ProspectingAndMillingUtil} from '../../../utils/prospect-milling.util';
import {Report} from '../../../utils/report.util';
import {ProfitSummary} from '../../addon/models/profit-summary.model';
import {TsmService} from '../../tsm/tsm.service';
import {AuctionItemStat} from '@shared/models/auction/auction-item-stat.model';
import {CraftingService} from '../../../services/crafting.service';
import {NpcService} from '../../npc/services/npc.service';
import {ItemService} from '../../../services/item.service';
import {ErrorReport} from '../../../utils/error-report.util';
import {Recipe} from '../../crafting/models/recipe';
import {AuctionTransformerUtil} from "@shared/utils/auction/auction-transformer.util";
import {AuctionV2} from "@shared/models/auction/auction-v2.model";

export interface OrganizedAuctionResult {
  map: Map<string, AuctionItem>;
  mapVariations: Map<number, AuctionItem[]>;
  list: AuctionItem[];
  auctions: Auction[];
}

export class AuctionUtil {

  private static modifierTest(auctions: Auction[]): void {
    const type = new Map<number, any>();
    const list = [];
    auctions.forEach(auction => {
      if (auction.modifiers) {
        auction.modifiers.forEach(modifier => {
          if (!type.has(modifier.type)) {
            type.set(modifier.type, {
              type: modifier.type,
              min: modifier.value,
              max: modifier.value,
              values: {},
              items: {}
            });
            list.push(type.get(modifier.type));
          }
          const entry = type.get(modifier.type);
          entry.values[modifier.value] = 1;
          entry.items[auction.item] = 1;

          if (entry.min > modifier.value) {
            entry.min = modifier.value;
          }
          if (entry.max < modifier.value) {
            entry.max = modifier.value;
          }
        });
      }
    });
    console.log('modifiers', list);
  }

  /**
   * Organizes the auctions into groups of auctions per item
   * Used in the auction service.
   * @param auctions A raw auction array
   */
  public static organize(auctions: AuctionV2[] | Auction[], stats: Map<string, ItemStats>): Promise<OrganizedAuctionResult> {
    return new Promise<OrganizedAuctionResult>((resolve, reject) => {
      try {
        // TODO: Remove later -> this.modifierTest(auctions);
        const t0 = performance.now();
        this.clearOldData();
        const list: AuctionItem[] = [];
        const mapVariations = new Map<number, AuctionItem[]>();
        const {
          map,
          auctionList
        } = this.groupAuctions(auctions, list, stats, mapVariations);
        this.calculateCosts(t0, map);
        this.setItemSources(map);
        Report.debug('AuctionUtil.organize', list, auctions.length);
        resolve({
          map,
          list,
          auctions: auctionList,
          mapVariations
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private static groupAuctions(
    auctions: AuctionV2[] | Auction[],
    list: AuctionItem[],
    stats: Map<string, ItemStats>,
    mapVariations: Map<number, AuctionItem[]>
  ): {
    map: Map<string, AuctionItem>,
    auctionList: Auction[]
  } {
    // Add back, if support for classic is added: SharedService.userAuctions.organizeCharacters(SharedService.user.characters);
    const map: Map<string, AuctionItem> = new Map<string, AuctionItem>();
    const idMap: Map<number, boolean> = new Map<number, boolean>();
    const auctionList: Auction[] = [];

    auctions.forEach((auction: AuctionV2 | Auction) => {
      const a = AuctionTransformerUtil.transform(auction);
      this.processAuction(a, map, list, stats, mapVariations);
      idMap.set(a.item, true);
      auctionList.push(a);
    });

    TsmService.list.value.forEach(tsm => {
      if (!idMap.has(tsm.Id)) {
        const auction = new Auction();
        auction.item = +tsm.Id;
        this.addNewAuctionItem(auction, false, '' + auction.item, map, list, stats);
      }
    });

    list.forEach(ai => {
      ai.auctions = ai.auctions.sort((a, b) => {
        return a.buyout / a.quantity - b.buyout / b.quantity;
      });
      const lowest = this.getLowest(ai);
      if (lowest) {
        ai.buyout = lowest.buyout / lowest.quantity;
      }
    });

    return {
      map,
      auctionList,
    };
  }

  private static getLowest(ai: AuctionItem) {
    let lowest = ai.auctions[0];
    for (let i = 0; i < ai.auctions.length; i++) {
      const {buyout, bid} = ai.auctions[i];
      if (buyout > 0 && buyout >= bid) {
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
    // ProspectingAndMillingUtil.setCosts();
    ProspectingAndMillingUtil.calculateCost(map);
    const t2 = performance.now();
    console.log(`Prices calc time ${t2 - t1} ms`);
  }

  private static processAuction(
    a: Auction, map: Map<string, AuctionItem>, list: AuctionItem[],
    stats: Map<string, ItemStats>, mapVariations: Map<number, AuctionItem[]>
  ) {
    const id = a.item + AuctionItemStat.bonusId(a.bonusLists, false);
    /**
     * Maybe implement this one instead in the future.
     AuctionItemStat.getId(
     a.item,
     a.petSpeciesId,
     a.bonusLists ? a.bonusLists.map(b => b.bonusListId) : undefined,
     a.modifiers
     );
     */
    if (a.petSpeciesId && AuctionUtil.isPetNotInList(a, map)) {
      const petId = AuctionUtil.getPetId(a);
      const auctionItem: AuctionItem = this.newAuctionItem(a, true, petId, stats);
      map.set(petId, auctionItem);
      list.push(auctionItem);
      AuctionUtil.setUserSaleRateForAuction(auctionItem);

      if (!AuctionUtil.isPetMissing(a)) {
        this.handlePetAuction(a, petId);
      }
    } else {
      if (!mapVariations.has(a.item)) {
        mapVariations.set(a.item, []);
      }
      if (a.bonusLists) {
        if (!map.has(id)) {
          this.addNewAuctionItem(a, true, id, map, list, stats);
          mapVariations.get(a.item).push(map.get(id));
        } else {
          AuctionUtil.updateAuctionItem(a, id, map);
        }
      }
      // TODO: Look into this, to avoid "non bonus" duplicates
      if (!map.has(a.item + '')) {
        this.addNewAuctionItem(a, true, '' + a.item, map, list, stats);
        mapVariations.get(a.item).push(map.get(a.item + ''));
      } else {
        AuctionUtil.updateAuctionItem(a, '' + a.item, map);
      }

    }
  }

  private static addNewAuctionItem(a, addAuction = true, id: string, map: Map<string, AuctionItem>,
                                   list: AuctionItem[], stats: Map<string, ItemStats>) {
    const auctionItem: AuctionItem = this.newAuctionItem(a, addAuction, id, stats);
    map.set(id, auctionItem);
    list.push(auctionItem);
    AuctionUtil.setUserSaleRateForAuction(auctionItem);
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
    const bonusIdsNotInMap = [];
    if (auction.bonusLists && useSuffix) {
      auction.bonusLists.forEach(b => {
        const bonus = SharedService.bonusIdMap[b.bonusListId];
        if (!bonus) {
          bonusIdsNotInMap.push(b.bonusListId);
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

    const idSuffix = bonusIdsNotInMap.length ? `(${bonusIdsNotInMap.join(', ')})` : '';

    return SharedService.items[auction.item] ?
      `${SharedService.items[auction.item].name}${nameSuffix}${tags}${idSuffix}` :
      'ItemModel name missing';
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

  private static newAuctionItem(auction: Auction, addAuction = true, id: string, stats: Map<string, ItemStats>): AuctionItem {
    const tmpAuc = AuctionUtil.getTempAuctionItem(auction, addAuction, id);
    const statId = AuctionItemStat.getId(
      auction.item,
      auction.petSpeciesId,
      auction.bonusLists ? auction.bonusLists.map(b => b.bonusListId) : undefined
    );

    if (TsmService.mapped.value.has(auction.item)) {
      AuctionUtil.setTSMData(auction, tmpAuc);
    }

    if (stats.has(statId)) {
      const stat = stats.get(statId);
      tmpAuc.mktPrice = stat.past7Days.price.avg;
      tmpAuc.stats = stat;
    }

    return tmpAuc;
  }

  private static setUserSaleRateForAuction(auction: AuctionItem) {
    const profitSummaryMain = SharedService.tsmAddonData.profitSummary;
    if (!profitSummaryMain || !SharedService.realms) {
      return;
    }
    const profitSummary: ProfitSummary = profitSummaryMain[SharedService.realms[SharedService.user.realm].name];
    if (profitSummary) {
      profitSummary.setSaleRateForItem(auction.itemID, auction);
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
      tmpAuc.modifiers = auction.modifiers;

      tmpAuc.bonusIds.forEach(b => {
        const bonus = SharedService.bonusIdMap[b];
        if (!bonus) {
          return;
        }
        if (bonus.level) {
          tmpAuc.itemLevel += bonus.level;
          tmpAuc.name += ` +${bonus.level} iLvL`;
        }
        if (bonus.quality) {
          tmpAuc.quality = bonus.quality;
        }
      });
    }
  }

  private static getRecipeWithVariation(item: AuctionItem, recipes: Recipe[]) {
    if (!item || !recipes) {
      return undefined;
    }
    return recipes.filter(recipe => {
      try {
        if (recipe && recipe.bonusIds && recipe.bonusIds.length && item.bonusIds) {
          for (let i = 0; i < item.bonusIds.length; i++) {
            const idMatches = recipe.bonusIds.filter(bId => bId === item.bonusIds[i]);
            if (idMatches && idMatches.length) {
              return true;
            }
          }
          return false;
        } else {
          return true;
        }
      } catch (error) {
        ErrorReport.sendError('AuctionUtil.getRecipeWithVariation', error);
        return false;
      }
    });
  }

  private static setItemSources(items: Map<string, AuctionItem>): void {
    try {
      items.forEach(item => {
        if (!item) {
          return;
        }
        item.source.recipe.all = this.getRecipeWithVariation(item,
          CraftingService.itemRecipeMap.value.get(item.itemID));
        if (item.source.recipe.all) {
          item.source.recipe.all.sort((a, b) => b.roi - a.roi);
        }
        item.source.recipe.materialFor = CraftingService.reagentRecipeMap.value.get(item.itemID);
        item.source.recipe.known = this.getRecipeWithVariation(item,
          CraftingService.itemRecipeMapPerKnown.value.get(item.itemID));
        if (item.source.recipe.known) {
          item.source.recipe.known.sort((a, b) => b.roi - a.roi);
        }

        item.source.npc = NpcService.itemNpcMap.value.get(item.itemID);
        item.source.tradeVendor = SharedService.tradeVendorItemMap[item.itemID];
        item.item = ItemService.mapped.value.get(item.itemID);

        item.source.destroy = {
          milling: {
            targetIn: ProspectingAndMillingUtil.millsSourceTargetsMap.get(item.itemID),
            sourceIn: ProspectingAndMillingUtil.millsSourceMap.get(item.itemID)
          },
          prospecting: {
            targetIn: ProspectingAndMillingUtil.prospectingSourceTargetsMap.get(item.itemID),
            sourceIn: ProspectingAndMillingUtil.prospectingSourceMap.get(item.itemID)
          }
        };
      });
    } catch (error) {
      ErrorReport.sendError('AuctionUtil.setItemSources', error);
    }
  }
}