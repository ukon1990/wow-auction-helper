import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {CustomProcUtil} from './custom-proc.util';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    PESSIMISTIC: 1
  };
  static readonly STRATEGY_LIST = [
    {id: 0, name: 'Optimistic', description: ''},
    {id: 1, name: 'Semioptimistic', description: ''},
    {id: 2, name: 'Pessimistic', description: ''}
  ];

  calculate(recipes: Recipe[]): void {
    recipes.forEach(r => this.calculateOne(r));
  }

  calculateOne(recipe: Recipe): void {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[recipe.itemID];
    recipe.procRate = CustomProcUtil.get(recipe);
    recipe.reagents.forEach(r => {
      let price;
      const vendor = this.getVendorPriceDetails(r.itemID);
      const overridePrice = this.getOverridePrice(r.itemID);
      if (overridePrice) {
        price = overridePrice * r.count;
      } else if (vendor) {
        if (vendor && vendor.stock && vendor.stock < r.count) {
          price = vendor.price * vendor.stock;
          price += this.getPrice(r.itemID, r.count - vendor.stock);
        } else {
          price = vendor.price * r.count;
        }
      } else {
        price = this.getPrice(r.itemID, r.count);
      }
      recipe.cost += price / recipe.procRate;
    });
    if (auctionItem) {
      recipe.buyout = auctionItem.buyout;
    }
    console.log(recipe);
    recipe.roi = recipe.buyout - recipe.cost;
  }

  getFallbackPrice(id: number, quantity: number): number {
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
