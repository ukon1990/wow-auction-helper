import {TradeVendor, TradeVendorItem} from '../../models/item/trade-vendor';

const primalSargerite: TradeVendor = {
  itemID: 151568,
  name: 'Primal Sargerite',
  useForCrafting: true,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(151718, 0.1),
    new TradeVendorItem(151719, 0.1),
    new TradeVendorItem(151720, 0.1),
    new TradeVendorItem(151721, 0.1),
    new TradeVendorItem(151722, 0.1),
    new TradeVendorItem(151579, 0.1),
    new TradeVendorItem(151564, 10),
    new TradeVendorItem(151565, 10),
    new TradeVendorItem(151566, 10),
    new TradeVendorItem(151567, 10)
  ]
};

const bloodOfSargeras: TradeVendor = {
  itemID: 124124,
  name: 'Blood of Sargeras',
  useForCrafting: true,
  itemsFiltered: [],
  items: [
    new TradeVendorItem(142117, 10),
    new TradeVendorItem(124118, 10),
    new TradeVendorItem(124119, 10),
    new TradeVendorItem(124120, 10),
    new TradeVendorItem(124121, 10),
    new TradeVendorItem(124107, 10),
    new TradeVendorItem(124108, 10),
    new TradeVendorItem(124109, 10),
    new TradeVendorItem(124110, 10),
    new TradeVendorItem(124111, 10),
    new TradeVendorItem(124112, 10),
    new TradeVendorItem(124101, 10),
    new TradeVendorItem(124102, 10),
    new TradeVendorItem(124103, 10),
    new TradeVendorItem(124104, 10),
    new TradeVendorItem(124105, 3),
    new TradeVendorItem(123918, 10),
    new TradeVendorItem(123919, 5),
    new TradeVendorItem(124113, 10),
    new TradeVendorItem(124115, 10),
    new TradeVendorItem(124438, 10),
    new TradeVendorItem(124439, 10),
    new TradeVendorItem(124437, 10),
    new TradeVendorItem(124440, 10),
    new TradeVendorItem(124441, 3)
  ]
};

export const legionTradeVendors: TradeVendor[] = [
  primalSargerite, bloodOfSargeras
];
