import {BaseCraftingUtil} from './base-crafting.util';

export class PessimisticCraftingUtil extends BaseCraftingUtil {
  getPrice(id: number, quantity: number): number {
    return 0;
  }
}
