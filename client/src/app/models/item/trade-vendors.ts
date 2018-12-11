import { TradeVendor, TradeVendorItem } from './trade-vendor';
import { SharedService } from '../../services/shared.service';
import { Item } from './item';

export class TradeVendors {
  public static setValues(): void {
    TRADE_VENDORS.forEach(vendor => {
      // Re-setting the item name in case of locale is not English
      if (SharedService.items[vendor.itemID]) {
        vendor.name = SharedService.items[vendor.itemID].name;
      }

      vendor.items.forEach(item => {
        item.value = SharedService.auctionItemsMap[item.itemID] !== undefined ?
          SharedService.auctionItemsMap[item.itemID].buyout * item.quantity : 0;
        item.buyout = SharedService.auctionItemsMap[item.itemID] !== undefined ?
          SharedService.auctionItemsMap[item.itemID].buyout : 0;
        if (SharedService.user.apiToUse !== 'none') {
          item.estDemand = SharedService.auctionItemsMap[item.itemID] !== undefined ?
            SharedService.auctionItemsMap[item.itemID].estDemand : 0;
          item.regionSaleAvg = SharedService.auctionItemsMap[item.itemID] !== undefined ?
            SharedService.auctionItemsMap[item.itemID].regionSaleAvg : 0;
          item.mktPrice = SharedService.auctionItemsMap[item.itemID] !== undefined ?
            SharedService.auctionItemsMap[item.itemID].mktPrice : 0;
          item.avgSold = SharedService.auctionItemsMap[item.itemID] !== undefined ?
            SharedService.auctionItemsMap[item.itemID].avgDailySold : 0;
        }
      });
      vendor.items.sort(function (a, b) {
        return b.value - a.value;
      });

      SharedService.tradeVendorMap[vendor.itemID] = vendor;
    });

    Object.keys(SharedService.tradeVendorMap)
    .forEach(key => {
      const item = {
        itemID: SharedService.tradeVendorMap[key].items[0].itemID,
        name: SharedService.tradeVendorMap[key].name,
        bestValueName: TradeVendors.getItem(key).name,
        value: SharedService.tradeVendorMap[key].items[0].value,
        tradeVendor: SharedService.tradeVendorMap[key]
      };
      SharedService.tradeVendorItemMap[item.tradeVendor.itemID] = item;
    });
  }
  private static getItem(itemID: any) {
    const item = SharedService
      .items[SharedService.tradeVendorMap[itemID].items[0].itemID];
    return item ? item : new Item();
  }
}

const inkTrader: TradeVendor = {
  itemID: 129032,
  name: 'Ink trader',
  useForCrafting: false,
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

const spiritOfHarmony: TradeVendor = {
  itemID: 76061,
  name: 'Spirit of Harmony',
  useForCrafting: false,
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

const frozenOrb: TradeVendor = {
  itemID: 43102,
  name: 'Frozen Orb',
  useForCrafting: false,
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

const primalSargerite: TradeVendor = {
  itemID: 151568,
  name: 'Primal Sargerite',
  useForCrafting: true,
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
  'itemID': 124124,
  'name': 'Blood of Sargeras',
  useForCrafting: true,
  'items': [{
    'itemID': 142117,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124118,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124119,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124120,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124121,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124107,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124108,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124109,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124110,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124111,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124112,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124101,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124102,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124103,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124104,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124105,
    'quantity': 3,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 123918,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 123919,
    'quantity': 5,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124113,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124115,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124438,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124439,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124437,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124440,
    'quantity': 10,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 124441,
    'quantity': 3,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }]
};

const primalSpirit: TradeVendor = {
  'itemID': 120945,
  'name': 'Primal spirit',
  useForCrafting: true,
  'items': [{
    'itemID': 113264,
    'quantity': 0.15,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 113263,
    'quantity': 0.15,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 113261,
    'quantity': 0.15,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 113262,
    'quantity': 0.15,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 118472,
    'quantity': 0.25,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 127759,
    'quantity': 0.25,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }, {
    'itemID': 108996,
    'quantity': 0.05,
    'value': 0,
    'estDemand': 0,
    'regionSaleAvg': 0,
    'mktPrice': 0,
    'avgSold': 0,
    'buyout': 0
  }]
};

export const TRADE_VENDORS = [
  inkTrader, primalSargerite, bloodOfSargeras, primalSpirit, frozenOrb, spiritOfHarmony
];
