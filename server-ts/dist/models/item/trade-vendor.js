"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TradeVendor {
    constructor() {
        this.useForCrafting = true;
    }
}
exports.TradeVendor = TradeVendor;
class TradeVendorItem {
    constructor(itemID, quantity) {
        this.value = 0;
        this.estDemand = 0;
        this.regionSaleAvg = 0;
        this.mktPrice = 0;
        this.avgSold = 0;
        this.buyout = 0;
        this.itemID = itemID;
        this.quantity = quantity;
    }
}
exports.TradeVendorItem = TradeVendorItem;
class TradeVendorItemValue {
}
exports.TradeVendorItemValue = TradeVendorItemValue;
//# sourceMappingURL=trade-vendor.js.map