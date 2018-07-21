"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trade_vendor_1 = require("./trade-vendor");
const shared_service_1 = require("../../services/shared.service");
const item_1 = require("./item");
class TradeVendors {
    static setValues() {
        exports.TRADE_VENDORS.forEach(vendor => {
            // Re-setting the item name in case of locale is not English
            if (shared_service_1.SharedService.items[vendor.itemID]) {
                vendor.name = shared_service_1.SharedService.items[vendor.itemID].name;
            }
            vendor.items.forEach(item => {
                item.value = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                    shared_service_1.SharedService.auctionItemsMap[item.itemID].buyout * item.quantity : 0;
                item.buyout = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                    shared_service_1.SharedService.auctionItemsMap[item.itemID].buyout : 0;
                if (shared_service_1.SharedService.user.apiToUse !== 'none') {
                    item.estDemand = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                        shared_service_1.SharedService.auctionItemsMap[item.itemID].estDemand : 0;
                    item.regionSaleAvg = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                        shared_service_1.SharedService.auctionItemsMap[item.itemID].regionSaleAvg : 0;
                    item.mktPrice = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                        shared_service_1.SharedService.auctionItemsMap[item.itemID].mktPrice : 0;
                    item.avgSold = shared_service_1.SharedService.auctionItemsMap[item.itemID] !== undefined ?
                        shared_service_1.SharedService.auctionItemsMap[item.itemID].avgDailySold : 0;
                }
            });
            vendor.items.sort(function (a, b) {
                return b.value - a.value;
            });
            shared_service_1.SharedService.tradeVendorMap[vendor.itemID] = vendor;
        });
        Object.keys(shared_service_1.SharedService.tradeVendorMap)
            .forEach(key => {
            const item = {
                itemID: shared_service_1.SharedService.tradeVendorMap[key].items[0].itemID,
                name: shared_service_1.SharedService.tradeVendorMap[key].name,
                bestValueName: TradeVendors.getItem(key).name,
                value: shared_service_1.SharedService.tradeVendorMap[key].items[0].value,
                tradeVendor: shared_service_1.SharedService.tradeVendorMap[key]
            };
            shared_service_1.SharedService.tradeVendorItemMap[item.tradeVendor.itemID] = item;
        });
    }
    static getItem(itemID) {
        const item = shared_service_1.SharedService
            .items[shared_service_1.SharedService.tradeVendorMap[itemID].items[0].itemID];
        return item ? item : new item_1.Item();
    }
}
exports.TradeVendors = TradeVendors;
const spiritOfHarmony = {
    itemID: 76061,
    name: 'Spirit of Harmony',
    useForCrafting: false,
    items: [
        new trade_vendor_1.TradeVendorItem(72094, 5),
        new trade_vendor_1.TradeVendorItem(72103, 5),
        new trade_vendor_1.TradeVendorItem(72238, 2),
        new trade_vendor_1.TradeVendorItem(74247, 1),
        new trade_vendor_1.TradeVendorItem(76734, 1),
        new trade_vendor_1.TradeVendorItem(72093, 20),
        new trade_vendor_1.TradeVendorItem(79101, 20),
        new trade_vendor_1.TradeVendorItem(74250, 5),
        new trade_vendor_1.TradeVendorItem(79255, 1),
        new trade_vendor_1.TradeVendorItem(72120, 20),
        new trade_vendor_1.TradeVendorItem(72988, 20),
        new trade_vendor_1.TradeVendorItem(74249, 20),
        new trade_vendor_1.TradeVendorItem(72092, 20)
    ]
};
const frozenOrb = {
    itemID: 43102,
    name: 'Frozen Orb',
    useForCrafting: false,
    items: [
        new trade_vendor_1.TradeVendorItem(36908, 1),
        new trade_vendor_1.TradeVendorItem(47556, 1 / 6),
        new trade_vendor_1.TradeVendorItem(45087, 1 / 4),
        new trade_vendor_1.TradeVendorItem(35622, 1),
        new trade_vendor_1.TradeVendorItem(35623, 1),
        new trade_vendor_1.TradeVendorItem(35624, 1),
        new trade_vendor_1.TradeVendorItem(35625, 1),
        new trade_vendor_1.TradeVendorItem(35627, 1),
        new trade_vendor_1.TradeVendorItem(36860, 1)
    ]
};
const primalSargerite = {
    itemID: 151568,
    name: 'Primal Sargerite',
    useForCrafting: true,
    items: [
        new trade_vendor_1.TradeVendorItem(151718, 0.1),
        new trade_vendor_1.TradeVendorItem(151719, 0.1),
        new trade_vendor_1.TradeVendorItem(151720, 0.1),
        new trade_vendor_1.TradeVendorItem(151721, 0.1),
        new trade_vendor_1.TradeVendorItem(151722, 0.1),
        new trade_vendor_1.TradeVendorItem(151579, 0.1),
        new trade_vendor_1.TradeVendorItem(151564, 10),
        new trade_vendor_1.TradeVendorItem(151565, 10),
        new trade_vendor_1.TradeVendorItem(151566, 10),
        new trade_vendor_1.TradeVendorItem(151567, 10)
    ]
};
const bloodOfSargeras = {
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
const primalSpirit = {
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
exports.TRADE_VENDORS = [
    primalSargerite, bloodOfSargeras, primalSpirit, frozenOrb, spiritOfHarmony
];
//# sourceMappingURL=trade-vendors.js.map