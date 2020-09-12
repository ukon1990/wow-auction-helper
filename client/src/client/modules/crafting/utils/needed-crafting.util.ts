import {BaseCraftingUtil} from './base-crafting.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {SharedService} from '../../../services/shared.service';
import {AuctionsService} from '../../../services/auctions.service';

export class NeededCraftingUtil extends BaseCraftingUtil {
  constructor(map: Map<string, AuctionItem>) {
    super(map);
  }

  getPrice(id: number, quantity: number): number {
    let price = 0;
    const auctionItem: AuctionItem = this.map.get('' + id);
    if (auctionItem) {
      let foundCount = 0, usedForCraftCount = 0;
      for (let i = 0; i < auctionItem.auctions.length && foundCount <= quantity; i++) {
        const auc = auctionItem.auctions[i],
          unitPrice = auc.buyout / auc.quantity;
        foundCount += auc.quantity;

        if (foundCount > quantity) {
          price += unitPrice * (quantity - usedForCraftCount);
        } else {
          price += unitPrice * auc.quantity;
          usedForCraftCount += auc.quantity;
        }
      }
    }
    return price;
  }
}
