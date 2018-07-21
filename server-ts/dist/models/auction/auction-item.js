"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuctionItem {
    constructor() {
        this.name = 'Unavailable';
        this.buyout = 0;
        this.bid = 0;
        this.auctions = new Array();
        this.regionSaleRate = 0;
        this.avgDailySold = 0;
        this.avgDailyPosted = 0;
        this.regionSaleAvg = 0;
        this.mktPrice = 0;
        this.vendorSell = 0;
        this.quantityTotal = 0;
    }
}
exports.AuctionItem = AuctionItem;
//# sourceMappingURL=auction-item.js.map