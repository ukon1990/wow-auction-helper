import { TradeVendor } from './trade-vendor';
import { SharedService } from '../../services/shared.service';

export class TradeVendors {
  public static setValues(): void {
    TRADE_VENDORS.forEach(vendor => {
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
      console.log(vendor);
    });
  }
}

const bloodOfSargeras: TradeVendor = {
  'itemID': 124124,
  'name': 'Blood of Sargeras',
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
  bloodOfSargeras, primalSpirit
];
