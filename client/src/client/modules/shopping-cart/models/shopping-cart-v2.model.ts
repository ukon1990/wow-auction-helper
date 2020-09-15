import {ShoppingCartItem} from './shopping-cart-item.model';

export class ShoppingCartV2 {
  // Recipe ID's
  recipes: ShoppingCartItem[] = [];
  recipeMap = {};
  shoppingString: string;
  reagents: ShoppingCartItem[] = [];
  reagentMap = {};

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
