import {NPC} from '../../modules/npc/models/npc.model';

export class TradeVendor {
  id?: number[];
  itemID: number;
  name: string;
  useForCrafting = true;
  items: Array<TradeVendorItem>;
  itemsFiltered: Array<TradeVendorItem> = [];
  vendors?: NPC[] = [];
  expansionId?: number;
  isAlliance: boolean;
  isHorde: boolean;
}

export class TradeVendorItem {
  itemID: number;
  quantity: number; // Numbers of items per parent item
  value = 0;
  estDemand = 0;
  regionSaleAvg = 0;
  mktPrice = 0;
  avgSold = 0;
  buyout = 0;
  roi = 0;
  sourceBuyout = 0;
  sourceID?: number;

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
