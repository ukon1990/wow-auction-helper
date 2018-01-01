export class TradeVendor {
  itemID: number;
  name: string;
  items: Array<TradeVendorItems>;
}

export class TradeVendorItems {
  itemID: number;
  quantity: number;
  value: number;
  estDemand: number;
  regionSaleAvg: number;
  mktPrice: number;
  avgSold: number;
  buyout: number;
}
