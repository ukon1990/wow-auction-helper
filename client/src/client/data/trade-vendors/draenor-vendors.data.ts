import {TradeVendor, TradeVendorItem} from '../../models/item/trade-vendor';

const krixelPinchwhistle: TradeVendor = {
  id: [0],
  itemID: 0,
  name: 'Krixel Pinchwhistle',
  useForCrafting: false,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(109119, 1 / 24),
    new TradeVendorItem(109118, 1 / 24),
    new TradeVendorItem(109693, 1 / 32),
    new TradeVendorItem(111557, 1 / 40),
    new TradeVendorItem(109127, 1 / 40),
    new TradeVendorItem(109124, 1 / 40),
    new TradeVendorItem(109125, 1 / 40),
    new TradeVendorItem(109126, 1 / 40),
    new TradeVendorItem(109129, 1 / 40),
    new TradeVendorItem(109128, 1 / 40),
    new TradeVendorItem(110609, 1 / 32),
    new TradeVendorItem(109136, 1 / 16),
    new TradeVendorItem(109135, 1 / 16),
    new TradeVendorItem(109134, 1 / 16),
    new TradeVendorItem(109133, 1 / 16),
    new TradeVendorItem(109132, 1 / 16),
    new TradeVendorItem(109131, 1 / 16),
    new TradeVendorItem(109144, 1 / 20),
    new TradeVendorItem(109143, 1 / 20),
    new TradeVendorItem(109142, 1 / 20),
    new TradeVendorItem(109141, 1 / 20),
    new TradeVendorItem(109140, 1 / 20),
    new TradeVendorItem(109139, 1 / 20),
    new TradeVendorItem(109138, 1 / 20),
    new TradeVendorItem(109137, 1 / 20)
  ]
};

const garrisonVendors: TradeVendor[] = [
  krixelPinchwhistle
];

const primalSpirit: TradeVendor = {
  'itemID': 120945,
  'name': 'Primal spirit',
  useForCrafting: true,
  itemsFiltered: [],
  'items': [
    new TradeVendorItem(113264, .15),
    new TradeVendorItem(113263, .15),
    new TradeVendorItem(113261, .15),
    new TradeVendorItem(113262, .15),
    new TradeVendorItem(118472, .25),
    new TradeVendorItem(127759, .25),
    new TradeVendorItem(108996, .05)]
};

export const draenorTradeVendors: TradeVendor[] = [
  primalSpirit// , ...garrisonVendors
];
