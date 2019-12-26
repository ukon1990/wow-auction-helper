import {TradeVendor, TradeVendorItem} from '../../models/item/trade-vendor';

const frozenOrb: TradeVendor = {
  itemID: 43102,
  name: 'Frozen Orb',
  useForCrafting: false,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(36908, 1),
    new TradeVendorItem(47556, 1 / 6),
    new TradeVendorItem(45087, 1 / 4),
    new TradeVendorItem(35622, 1),
    new TradeVendorItem(35623, 1),
    new TradeVendorItem(35624, 1),
    new TradeVendorItem(35625, 1),
    new TradeVendorItem(35627, 1),
    new TradeVendorItem(36860, 1)
  ]
};

export const wotlkTradeVendors: TradeVendor[] = [
  frozenOrb
];
