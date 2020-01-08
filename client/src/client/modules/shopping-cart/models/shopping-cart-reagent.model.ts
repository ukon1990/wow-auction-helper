export class ShoppingCartReagent {
  itemID: number;
  intermediateCount = 0;
  quantity: number;

  constructor(itemID: number, quantity: number) {
    this.itemID = itemID;
    this.quantity = quantity;
  }
}
