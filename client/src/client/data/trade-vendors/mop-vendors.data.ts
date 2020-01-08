import {TradeVendor, TradeVendorItem} from '../../models/item/trade-vendor';

const spiritOfHarmony: TradeVendor = {
  isAlliance: false, isHorde: false,
  itemID: 76061,
  name: 'Spirit of Harmony',
  useForCrafting: false,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(72094, 5),
    new TradeVendorItem(72103, 5),
    new TradeVendorItem(72238, 2),
    new TradeVendorItem(74247, 1),
    new TradeVendorItem(76734, 1),
    new TradeVendorItem(72093, 20),
    new TradeVendorItem(79101, 20),
    new TradeVendorItem(74250, 5),
    new TradeVendorItem(79255, 1),
    new TradeVendorItem(72120, 20),
    new TradeVendorItem(72988, 20),
    new TradeVendorItem(74249, 20),
    new TradeVendorItem(72092, 20)
  ]
};

export const mopTradeVendors: TradeVendor[] = [
  spiritOfHarmony
];
