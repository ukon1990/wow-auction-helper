import {SharedService} from '../services/shared.service';
import {Item} from './item/item';
import {TRADE_VENDORS} from '../data/trade-vendors';
import {TradeVendor, TradeVendorItem} from './item/trade-vendor';
import {AuctionItem} from '../modules/auction/models/auction-item.model';

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

  private static setVendorValues(vendor: TradeVendor) {
    // Re-setting the item name in case of locale is not English
    if (SharedService.items[vendor.itemID]) {
      vendor.name = SharedService.items[vendor.itemID].name;
    }

    vendor.items.forEach(item => {
      this.setItemValue(item, vendor);
    });
    vendor.items.sort(function (a, b) {
      return b.value - a.value;
    });

    SharedService.tradeVendorMap[vendor.itemID] = vendor;
  }

  private static updateTradeVendorItemMap(key) {
    const {sourceID, sourceBuyout, value, roi, itemID} = SharedService.tradeVendorMap[key].items[0] as TradeVendorItem;
    const item = {
      sourceID,
      itemID,
      sourceBuyout,
      name: SharedService.tradeVendorMap[key].name,
      bestValueName: TradeVendors.getItem(key).name,
      value,
      tradeVendor: SharedService.tradeVendorMap[key],
      roi
    };
    SharedService.tradeVendorItemMap[item.tradeVendor.itemID] = item;
  }

  private static setItemValue(item: TradeVendorItem, vendor: TradeVendor) {
    item.sourceID = vendor.itemID;
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[item.itemID],
      vendorAuctionItem: AuctionItem = SharedService.auctionItemsMap[vendor.itemID];
    item.value = auctionItem !== undefined ?
      auctionItem.buyout * item.quantity : 0;
    item.buyout = auctionItem !== undefined ?
      auctionItem.buyout : 0;
    item.roi = vendorAuctionItem ? item.value - vendorAuctionItem.buyout : item.value;
    if (vendorAuctionItem) {
      item.sourceBuyout = vendorAuctionItem.buyout;
      // console.log('Buyout', item.roi, item.value - vendorAuctionItem.buyout) ;
    }
    if (SharedService.user.apiToUse !== 'none') {
      this.setItemApiValues(item);
    }
  }

  private static setItemApiValues(item: TradeVendorItem) {
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
