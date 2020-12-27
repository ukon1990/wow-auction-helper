import {TradeVendor, TradeVendorItem} from '../../models/item/trade-vendor';
import {draenorTradeVendors} from './draenor-vendors.data';
import {legionTradeVendors} from './legion-vendors.data';
import {wotlkTradeVendors} from './wotlk-vendors.data';
import {mopTradeVendors} from './mop-vendors.data';

const inkTrader: TradeVendor = {
  isAlliance: false, isHorde: false,
  itemID: 129032,
  name: 'Ink trader',
  useForCrafting: false,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(113111, 1),
    new TradeVendorItem(79255, 0.1),
    new TradeVendorItem(79254, 1),
    new TradeVendorItem(61981, 0.1),
    new TradeVendorItem(61978, 1),
    new TradeVendorItem(43126, 1),
    new TradeVendorItem(43127, 0.1),
    new TradeVendorItem(43124, 1),
    new TradeVendorItem(43122, 1),
    new TradeVendorItem(43120, 1),
    new TradeVendorItem(43118, 1),
    new TradeVendorItem(43116, 1),
    new TradeVendorItem(39774, 1),
    new TradeVendorItem(39469, 1)
  ]
};
// ...legionTradeVendors, inkTrader, ...draenorTradeVendors, ...mopTradeVendors, ...wotlkTradeVendors

// Are now added via npc.model.ts
export const TRADE_VENDORS = [];
