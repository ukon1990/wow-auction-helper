import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';

export abstract class BaseCraftingUtil {
  static readonly STRATEGY = {
    OPTIMISTIC: 0,
    PESSIMISTIC: 1
  };

  calculate(recipes: Recipe[], auctionItems: {}): void {
    recipes.forEach(r => this.calculateOne(r, auctionItems));
  }


  getVendorPriceDetails(id: number): { price: number; stock: number } {
    const result = {
      price: 0,
      stock: 0
    };
    const item: ItemNpcDetails = SharedService.itemNpcMap.get(id);
    if (item) {
      return {
        price: item.vendorBuyPrice,
        stock: item.vendorAvailable
      };
    }
    return undefined;
  }

  abstract calculateOne(recipe: Recipe, auctionItems: {}): void;
}
