import {Reagent} from '../../crafting/models/reagent';

interface CartObject {
  id: number;
  quantity: number;
  buyout?: number;
  name?: string;
}

export interface CartRecipe extends CartObject {
  itemId?: number;
  isIntermediate: boolean;
}

export interface CartItem extends CartObject {
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
  neededItems: Reagent[];
}
