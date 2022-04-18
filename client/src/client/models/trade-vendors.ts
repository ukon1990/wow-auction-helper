import {SharedService} from '../services/shared.service';
import {Item} from '@shared/models';
import {TRADE_VENDORS} from '../data/trade-vendors';
import {TradeVendor, TradeVendorItem} from './item/trade-vendor';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {ObjectUtil} from '@ukon1990/js-utilities';

export class TradeVendors {

  public static setValues(map: Map<string, AuctionItem>): void {
    TRADE_VENDORS.forEach(vendor => {
      this.setVendorValues(vendor, map);
    });

    Object.keys(SharedService.tradeVendorMap)
      .forEach(key => {
        this.updateTradeVendorItemMap(key, map);
      });
  }

  private static setVendorValues(vendor: TradeVendor, map: Map<string, AuctionItem>) {
    // Re-setting the item name in case of locale is not English
    if (SharedService.items[vendor.itemID]) {
      vendor.name = SharedService.items[vendor.itemID].name;
    }

    try {
      (vendor && vendor.items ? this.castTVToArray(vendor.items) : []).forEach(item => {
        this.setItemValue(item, vendor, map);
      });
      this.castTVToArray(vendor.items).sort(function (a, b) {
        return b.value - a.value;
      });
    } catch (e) {
      console.error('setVendorValues', vendor.items, e);
    }

    SharedService.tradeVendorMap[vendor.itemID] = vendor;
  }

  // TODO: Fix this dumbassery -> Find out what is causing the need for this.
  private static castTVToArray(array: any[]) {
    return array.length !== undefined ?
      array : Object.keys(array).map(key => array[key]);
  }

  private static updateTradeVendorItemMap(key, map: Map<string, AuctionItem>) {
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
    if (SharedService.tradeVendorItemMap[item.tradeVendor.itemID]) {
      ObjectUtil.overwrite(item, SharedService.tradeVendorItemMap[item.tradeVendor.itemID]);
    } else {
      SharedService.tradeVendorItemMap[item.tradeVendor.itemID] = item;
    }
  }

  private static setItemValue(item: TradeVendorItem, vendor: TradeVendor, map: Map<string, AuctionItem>) {
    item.sourceID = vendor.itemID;
    const auctionItem: AuctionItem = map.get('' + item.itemID),
      vendorAuctionItem: AuctionItem = map.get('' + vendor.itemID);
    item.value = auctionItem !== undefined ?
      auctionItem.buyout * item.quantity : 0;
    item.buyout = auctionItem !== undefined ?
      auctionItem.buyout : 0;
    item.roi = vendorAuctionItem ? item.value - vendorAuctionItem.buyout : item.value;
    if (vendorAuctionItem) {
      item.sourceBuyout = vendorAuctionItem.buyout;
    }
    this.setItemApiValues(item, map);
  }

  private static setItemApiValues(item: TradeVendorItem, map: Map<string, AuctionItem>) {
    item.regionSaleAvg = map.get('' + item.itemID) !== undefined ?
      map.get('' + item.itemID).regionSaleAvg : 0;
    item.mktPrice = map.get('' + item.itemID) !== undefined ?
      map.get('' + item.itemID).mktPrice : 0;
    item.avgSold = map.get('' + item.itemID) !== undefined ?
      map.get('' + item.itemID).avgDailySold : 0;
  }

  private static getItem(itemID: any) {
    const item = SharedService
      .items[SharedService.tradeVendorMap[itemID].items[0].itemID];
    return item ? item : new Item();
  }
}