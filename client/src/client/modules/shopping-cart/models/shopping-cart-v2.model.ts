import {ShoppingCartItem} from './shopping-cart-item.model';

export interface CartRecipe {
  id: number;
  quantity: number;
  isIntermediate: boolean;
}

export interface CartItem {
  id: number;
  quantity: number;
  isReagent: boolean;
}

export interface Cart {
  dunno: string;
}

export class ShoppingCartV2 {
  sources = {
    inventory: [],
    ah: [],
    vendor: [],
    farm: []
  };
  totalValue = 0;
  sumCost = 0;
  sumTotalCost = 0;
  profit = 0;
  sumEstimatedInventoryCost = 0;
  tsmShoppingString = '';
}
