import {SharedService} from '../services/shared.service';
import {Item} from './item/item';
import {TRADE_VENDORS} from '../data/trade-vendors';

export class TradeVendors {
  public static setValues(): void {
    TRADE_VENDORS.forEach(vendor => {
      this.setVendorValues(vendor);
    });

    Object.keys(SharedService.tradeVendorMap)
      .forEach(key => {
        this.updateTradeVendorItemMap(key);
      });
  }

  private static setVendorValues(vendor) {
// Re-setting the item name in case of locale is not English
    if (SharedService.items[vendor.itemID]) {
      vendor.name = SharedService.items[vendor.itemID].name;
    }

    vendor.items.forEach(item => {
      this.setItemValue(item);
    });
    vendor.items.sort(function (a, b) {
      return b.value - a.value;
    });

    SharedService.tradeVendorMap[vendor.itemID] = vendor;
  }

  private static updateTradeVendorItemMap(key) {
    const item = {
      itemID: SharedService.tradeVendorMap[key].items[0].itemID,
      name: SharedService.tradeVendorMap[key].name,
      bestValueName: TradeVendors.getItem(key).name,
      value: SharedService.tradeVendorMap[key].items[0].value,
      tradeVendor: SharedService.tradeVendorMap[key]
    };
    SharedService.tradeVendorItemMap[item.tradeVendor.itemID] = item;
  }

  private static setItemValue(item) {
    item.value = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].buyout * item.quantity : 0;
    item.buyout = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].buyout : 0;
    if (SharedService.user.apiToUse !== 'none') {
      this.setItemApiValues(item);
    }
  }

  private static setItemApiValues(item) {
    item.estDemand = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].estDemand : 0;
    item.regionSaleAvg = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].regionSaleAvg : 0;
    item.mktPrice = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].mktPrice : 0;
    item.avgSold = SharedService.auctionItemsMap[item.itemID] !== undefined ?
      SharedService.auctionItemsMap[item.itemID].avgDailySold : 0;
  }

  private static getItem(itemID: any) {
    const item = SharedService
      .items[SharedService.tradeVendorMap[itemID].items[0].itemID];
    return item ? item : new Item();
  }
}
