import { AuctionItem } from '../models/auction/auction-item';
import { ItemMarketReset } from '../models/item/item-market-reset.model';
import { SharedService } from '../services/shared.service';

export class MarketResetUtil {

  findMatches(): ItemMarketReset[] {
    const list: ItemMarketReset[] = [];

    SharedService.auctionItems.forEach((auctionItem: AuctionItem) => {
      list.push(this.calculateForItem(auctionItem));
    });

    return list;
  }

  calculateForItem(auctionItem: AuctionItem): ItemMarketReset {
    // logic
    return new ItemMarketReset();
  }
}
