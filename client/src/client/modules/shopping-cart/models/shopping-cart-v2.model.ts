import {Reagent, ReagentSource, ReagentSources} from '../../crafting/models/reagent';

interface CartObject {
  id: number;
  quantity: number;
  buyout?: number;
  name?: string;
}

export interface CartRecipe extends CartObject {
  itemId?: number;
  isIntermediate: boolean;
  cost?: number;
  roi?: number;
  sumRoi?: number;
}

export interface CartItem extends CartObject {
  isReagent: boolean;
}

export interface Cart {
  dunno: string;
}

export class CartSources {
  override: ReagentSource[];
  tradeVendor: ReagentSource[];
  vendor: ReagentSource[];
  ah: ReagentSource[];
  farm: ReagentSource[];
  intermediate: ReagentSource[];
  inventory: ReagentSource[];
}

export class ShoppingCartV2 {
  sources: CartSources;
  totalValue = 0;
  sumCost = 0;
  sumTotalCost = 0;
  profit = 0;
  sumEstimatedInventoryCost = 0;
  tsmShoppingString = '';
  neededItems: Reagent[];
}
