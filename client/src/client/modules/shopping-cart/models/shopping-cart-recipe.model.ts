import {ShoppingCartReagent} from './shopping-cart';

export class ShoppingCartRecipe {
  spellID: number;
  itemID: number;
  quantity = 1;
  intermediateCount = 0;
  reagents: Array<ShoppingCartReagent> = Array<ShoppingCartReagent>();

  constructor(spellID: number, itemID: number) {
    this.spellID = spellID;
    this.itemID = itemID;
  }
}
