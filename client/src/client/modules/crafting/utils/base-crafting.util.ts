import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CustomProcUtil} from './custom-proc.util';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    NEEDED: 1,
    PESSIMISTIC: 2
  };
  static readonly STRATEGY_LIST = [
    {id: 0, name: 'Optimistic', description: ''},
    {id: 1, name: 'Semioptimistic', description: ''},
    {id: 2, name: 'Pessimistic', description: ''}
  ];
  private ahCutModifier = 0.95;

  calculate(recipes: Recipe[]): void {
    recipes.forEach(r => this.calculateOne(r));
  }

  calculateOne(recipe: Recipe): void {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[recipe.itemID];
    recipe.procRate = CustomProcUtil.get(recipe);
    recipe.reagents.forEach(r => {
      let price;
      const vendor = this.getVendorPriceDetails(r.itemID),
        overridePrice = this.getOverridePrice(r.itemID),
        tradeVendorPrice = this.getTradeVendorPrice(r.itemID);
      if (overridePrice) {
        price = overridePrice * r.count;
      } else if (vendor) {
        if (vendor && vendor.stock && vendor.stock < r.count) {
          price = vendor.price * vendor.stock;
          price += this.getPrice(r.itemID, r.count - vendor.stock);
        } else {
          price = vendor.price * r.count;
        }
      } else if (tradeVendorPrice) {
        price = tradeVendorPrice * r.count;
      } else {
        price = this.getPrice(r.itemID, r.count);
      }
      if (!price) {
        price = this.getFallbackPrice(r.itemID, r.count);
      }
      r.avgPrice = price / r.count;
      recipe.cost += price / recipe.procRate;
    });
    if (auctionItem) {
      recipe.buyout = auctionItem.buyout * this.ahCutModifier;
    }
    recipe.roi = recipe.buyout - recipe.cost;
  }

  getFallbackPrice(id: number, quantity: number): number {
    console.error('getFallbackPrice is not implemented!');
    return 0;
  }

  getTradeVendorPrice(id: number): number {
    if (SharedService.tradeVendorItemMap[id] && SharedService.tradeVendorMap[id].useForCrafting) {
      return SharedService.tradeVendorItemMap[id].value;
    }
    return 0;
  }

  getVendorPriceDetails(id: number): { price: number; stock: number } {
    const item: ItemNpcDetails = SharedService.itemNpcMap.get(id);
    if (item) {
      return {
        price: item.vendorBuyPrice,
        stock: item.vendorAvailable
      };
    }
    return undefined;
  }

  getOverridePrice(id: number): number {
    if (SharedService.customPricesMap && SharedService.customPricesMap[id]) {
      return SharedService.customPricesMap[id];
    }
    return 0;
  }

  abstract getPrice(id: number, quantity: number): number;
}
