import {BaseCraftingUtil} from './base-crafting.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {Item} from '../../../models/item/item';

export class OptimisticCraftingUtil extends BaseCraftingUtil {
  constructor(map: Map<string, AuctionItem>, public items: Map<number, Item>, public faction: number,
              useIntermediateCrafting: boolean = false, public useInventory: boolean = false) {
    super(map, items, faction, useIntermediateCrafting, useInventory);
  }

  getPrice(id: number, quantity: number): number {
    const item: AuctionItem = this.map.get('' + id);
    if (item) {
      return item.buyout * quantity;
    }
    return 0;
  }
}
