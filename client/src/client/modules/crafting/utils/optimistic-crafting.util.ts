import {BaseCraftingUtil} from './base-crafting.util';
import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../auction/models/auction-item.model';

export class OptimisticCraftingUtil extends BaseCraftingUtil {
  constructor() {
    super();
  }

  getPrice(id: number, quantity: number): number {
    const item: AuctionItem = SharedService.auctionItemsMap[id];
    if (item) {
      return item.buyout * quantity;
    }
    return 0;
  }
}
