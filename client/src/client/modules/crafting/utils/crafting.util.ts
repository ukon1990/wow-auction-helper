import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {CraftingService} from '../../../services/crafting.service';
import {Filters} from '../../../utils/filtering';
import {PessimisticCraftingUtil} from './pessimistic-crafting.util';
import {BaseCraftingUtil} from './base-crafting.util';
import {OptimisticCraftingUtil} from './optimistic-crafting.util';
import {NeededCraftingUtil} from './needed-crafting.util';
import {Report} from '../../../utils/report.util';
import {TsmService} from '../../tsm/tsm.service';
import {NpcService} from '../../npc/services/npc.service';
import {AuctionsService} from '../../../services/auctions.service';
import {AuctionItem} from '../../auction/models/auction-item.model';

export class CraftingUtil {
  public static ahCutModifier = 0.95;
  public static strategy: BaseCraftingUtil;
  private static auctionService: AuctionsService;

  static init(auctionsService: AuctionsService) {
    this.auctionService = auctionsService;
  }

  public static calculateCost(strategyHasChanged = false, map: Map<string, AuctionItem>): void {
    const STRATEGY = BaseCraftingUtil.STRATEGY,
      selectedStrategy = SharedService.user.craftingStrategy;
    if (!this.strategy || strategyHasChanged) {
      switch (selectedStrategy) {
        case STRATEGY.OPTIMISTIC:
          this.strategy = new OptimisticCraftingUtil(map);
          break;
        case STRATEGY.PESSIMISTIC:
          this.strategy = new PessimisticCraftingUtil(undefined, undefined, map);
          break;
        default:
          this.strategy = new NeededCraftingUtil(map);
          break;
      }
      Report.send(
        'calculateCost',
        'CraftingUtil',
        'Calculated with strategy: ' + BaseCraftingUtil.STRATEGY_LIST[selectedStrategy].name);
    }

    this.strategy.calculate(CraftingService.list.value);
    CraftingService.itemRecipeMapPerKnown.value.forEach((recipes) =>
      recipes.sort((a, b) => b.roi - a.roi));
  }

  public static getCost(id: number, count: number): number {
    if (SharedService.customPricesMap && SharedService.customPricesMap[id]) {
      return (SharedService.customPricesMap[id].price * count);
    } else if (CraftingUtil.isVendorCheaperThanAH(id)) {
      return this.getNeededBuyPriceFromVendor(id, count);
    } else if (SharedService.tradeVendorItemMap[id] && SharedService.tradeVendorMap[id].useForCrafting) {
      return (SharedService.tradeVendorItemMap[id].value * count);
    } else if (this.auctionService.getById(id) && !CraftingUtil.isBelowMktBuyoutValue(id)) {
      return this.auctionService.getById(id).buyout * count;
    } else if (CraftingUtil.existsInTSM(id)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return (TsmService.getById(id).MarketValue * count);
    }
    return 0;
  }

  private static getNeededBuyPriceFromVendor(itemID: number, count: number) {
    const itemNpcDetails = NpcService.itemNpcMap.value.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.vendorAvailable > 0 && itemNpcDetails.vendorAvailable < count) {
        return itemNpcDetails.vendorBuyPrice * itemNpcDetails.vendorAvailable +
          (this.auctionService.getById(itemID) ?
            this.auctionService.getById(itemID).buyout * (count - itemNpcDetails.vendorAvailable) : 0);
      }
      return (itemNpcDetails.vendorBuyPrice * count);
    }
    return 0;
  }

  public static isVendorCheaperThanAH(itemID: number): boolean {
    const itemNpcDetails = NpcService.itemNpcMap.value.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.soldBy.length && SharedService.user.useVendorPriceForCraftingIfAvailable) {
        if (!this.auctionService.getById(itemID)) {
          return true;
        } else if (itemNpcDetails.vendorBuyPrice < this.auctionService.getById(itemID).buyout) {
          return true;
        }
      }
    }
    return false;
  }

  private static getItem(itemID: number): Item {
    return SharedService.items[itemID];
  }

  private static existsInTSM(id: number): boolean {
    return Filters.isUsingAPI() && !!TsmService.getById(id);
  }

  private static isBelowMktBuyoutValue(id: number): boolean {
    return CraftingUtil.existsInTSM(id) &&
      this.auctionService.getById(id).buyout /
      TsmService.getById(id).MarketValue * 100 >=
      SharedService.user.buyoutLimit;
  }
}
