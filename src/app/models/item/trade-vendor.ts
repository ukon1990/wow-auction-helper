export class TradeVendor {
  itemID: number;
  name: string;
  useForCrafting = true;
  items: Array<TradeVendorItem>;
}

export class TradeVendorItem {
  itemID: number;
  quantity: number; // Numers of items per parent item
  value = 0;
  estDemand = 0;
  regionSaleAvg = 0;
  mktPrice = 0;
  avgSold = 0;
  buyout = 0;

  constructor(itemID: number, quantity: number) {
    this.itemID = itemID;
    this.quantity = quantity;
  }
}

export class TradeVendorItemValue {
  itemID: number;
  name: string;
  bestValueName: string;
  value: number;
  tradeVendor?: TradeVendor;
}
