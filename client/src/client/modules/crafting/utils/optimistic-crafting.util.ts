import {BaseCraftingUtil} from './base-crafting.util';
import {Recipe} from '../models/recipe';
import {SharedService} from '../../../services/shared.service';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {AuctionsService} from '../../../services/auctions.service';

export class OptimisticCraftingUtil extends BaseCraftingUtil {
  constructor(private service: AuctionsService) {
    super(service);
  }

  getPrice(id: number, quantity: number): number {
    const item: AuctionItem = this.service.getById(id);
    if (item) {
      return item.buyout * quantity;
    }
    return 0;
  }
}
