import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {CraftingService} from '../../../services/crafting.service';
import {Filters} from '../../../utils/filtering';
import {PessimisticCraftingUtil} from './pessimistic-crafting.util';
import {BaseCraftingUtil} from './base-crafting.util';
import {OptimisticCraftingUtil} from './optimistic-crafting.util';
import {NeededCraftingUtil} from './needed-crafting.util';
import {Report} from '../../../utils/report.util';

export class CraftingUtil {
  public static ahCutModifier = 0.95;
  public static strategy: BaseCraftingUtil;

  public static calculateCost(strategyHasChanged = false): void {
    const STRATEGY = BaseCraftingUtil.STRATEGY,
      selectedStrategy = SharedService.user.craftingStrategy;
    if (!this.strategy || strategyHasChanged) {
      switch (selectedStrategy) {
        case STRATEGY.OPTIMISTIC:
          this.strategy = new OptimisticCraftingUtil();
          break;
        case STRATEGY.PESSIMISTIC:
          this.strategy = new PessimisticCraftingUtil();
          break;
        default:
          this.strategy = new NeededCraftingUtil();
          break;
      }
      Report.send(
        'calculateCost',
        'CraftingUtil',
        'Calculated with strategy: ' + BaseCraftingUtil.STRATEGY_LIST[selectedStrategy].name);
    }

    this.strategy.calculate(CraftingService.list.value);
  }

  public static getCost(itemID: number, count: number): number {
    if (SharedService.customPricesMap && SharedService.customPricesMap[itemID]) {
      return (SharedService.customPricesMap[itemID].price * count);
    } else if (CraftingUtil.isVendorCheaperThanAH(itemID)) {
      return this.getNeededBuyPriceFromVendor(itemID, count);
    } else if (SharedService.tradeVendorItemMap[itemID] && SharedService.tradeVendorMap[itemID].useForCrafting) {
      return (SharedService.tradeVendorItemMap[itemID].value * count);
    } else if (SharedService.auctionItemsMap[itemID] && !CraftingUtil.isBelowMktBuyoutValue(itemID)) {
      return SharedService.auctionItemsMap[itemID].buyout * count;
    } else if (CraftingUtil.existsInTSM(itemID)) {
      // Using the tsm list, so that we can get mktPrice if an item is not @ AH
      return (SharedService.tsm[itemID].MarketValue * count);
    }
    return 0;
  }

  private static getNeededBuyPriceFromVendor(itemID: number, count: number) {
    const itemNpcDetails = SharedService.itemNpcMap.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.vendorAvailable > 0 && itemNpcDetails.vendorAvailable < count) {
        return itemNpcDetails.vendorBuyPrice * itemNpcDetails.vendorAvailable +
          (SharedService.auctionItemsMap[itemID] ?
            SharedService.auctionItemsMap[itemID].buyout * (count - itemNpcDetails.vendorAvailable) : 0);
      }
      return (itemNpcDetails.vendorBuyPrice * count);
    }
    return 0;
  }

  public static isVendorCheaperThanAH(itemID: number): boolean {
    const itemNpcDetails = SharedService.itemNpcMap.get(itemID);
    if (itemNpcDetails) {
      if (itemNpcDetails.soldBy.length && SharedService.user.useVendorPriceForCraftingIfAvailable) {
        if (!SharedService.auctionItemsMap[itemID]) {
          return true;
        } else if (itemNpcDetails.vendorBuyPrice < SharedService.auctionItemsMap[itemID].buyout) {
          return true;
        }
      }
    }
    return false;
  }

  private static getItem(itemID: number): Item {
    return SharedService.items[itemID];
  }

  /*
    public static getReagentCraftCost(itemID: number, count: number): number {
      return
    }*/

  private static existsInTSM(itemID: number): boolean {
    return Filters.isUsingAPI() && SharedService.tsm[itemID];
  }

  private static isBelowMktBuyoutValue(itemID: number): boolean {
    return CraftingUtil.existsInTSM(itemID) && SharedService.auctionItemsMap[itemID].buyout /
      SharedService.tsm[itemID].MarketValue * 100 >=
      SharedService.user.buyoutLimit;
  }
}
