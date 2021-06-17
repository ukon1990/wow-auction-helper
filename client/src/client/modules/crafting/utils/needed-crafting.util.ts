import {BaseCraftingUtil} from './base-crafting.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Item} from '../../../models/item/item';

export class NeededCraftingUtil extends BaseCraftingUtil {
  constructor(
    public map: Map<string, AuctionItem>,
    public variations: Map<number, AuctionItem[]>,
    public items: Map<number, Item>,
    public faction: number,
    useIntermediateCrafting: boolean = false,
    public useInventory: boolean = false
  ) {
    super(map, variations, items, faction, useIntermediateCrafting, useInventory);
  }

  getPrice(id: number, quantity: number): number {
    let price = 0;
    const auctionItem: AuctionItem = this.map.get('' + id);
    if (auctionItem && auctionItem.buyout > 0) {
      let foundCount = 0, usedForCraftCount = 0;
      for (let i = 0; i < auctionItem.auctions.length && foundCount <= quantity; i++) {
        const auc = auctionItem.auctions[i],
          unitPrice = auc.buyout / auc.quantity;
        if (unitPrice > 0) {
          foundCount += auc.quantity;
          if (foundCount > quantity) {
            price += unitPrice * (quantity - usedForCraftCount);
          } else {
            price += unitPrice * auc.quantity;
            usedForCraftCount += auc.quantity;
          }
        }
      }
    }
    return price;
  }
}
