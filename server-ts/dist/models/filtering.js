"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
const item_classes_1 = require("./item/item-classes");
class Filters {
    static isNameMatch(itemID, form) {
        if (form.value.name === null || form.value.name.length === 0) {
            return true;
        }
        return Filters.getItemName(itemID).toLowerCase().indexOf(form.value.name.toLowerCase()) > -1;
    }
    static isBelowMarketValue(itemID, form) {
        if (Filters.isUsingAPI() && (form.value.mktPrice === null || form.value.mktPrice === 0)) {
            return true;
        }
        else if (Filters.isUsingAPI() && shared_service_1.SharedService.auctionItemsMap[itemID].mktPrice === 0) {
            return false;
        }
        else if (Filters.isUsingAPI()) {
            return Math.round((shared_service_1.SharedService.auctionItemsMap[itemID].buyout / shared_service_1.SharedService.auctionItemsMap[itemID].mktPrice) * 100) <= form.value.mktPrice;
        }
        return true;
    }
    static isBelowVendorPrice(itemID, form) {
        if (form.value.onlyVendorSellable) {
            return shared_service_1.SharedService.auctionItemsMap[itemID].vendorSell > 0 &&
                shared_service_1.SharedService.auctionItemsMap[itemID].buyout <= shared_service_1.SharedService.auctionItemsMap[itemID].vendorSell &&
                shared_service_1.SharedService.auctionItemsMap[itemID].bid <= shared_service_1.SharedService.auctionItemsMap[itemID].vendorSell;
        }
        return true;
    }
    static isSaleRateMatch(itemID, form) {
        if (Filters.isUsingAPI() && form.value.saleRate && form.value.saleRate > 0) {
            return shared_service_1.SharedService.auctionItemsMap[itemID].regionSaleRate >= form.value.saleRate / 100;
        }
        return true;
    }
    static isDailySoldMatch(itemID, form) {
        if (Filters.isUsingAPI() && form.value.avgDailySold && form.value.avgDailySold > 0) {
            return shared_service_1.SharedService.auctionItemsMap[itemID].avgDailySold >= form.value.avgDailySold;
        }
        return true;
    }
    static isItemClassMatch(itemID, form) {
        const itemClass = shared_service_1.SharedService.items[itemID] ? shared_service_1.SharedService.items[itemID].itemClass : -1;
        if (form.value.itemClass === null || form.value.itemClass === '-1' || form.value.itemClass === -1) {
            return true;
        }
        else if (item_classes_1.itemClasses.classes[form.value.itemClass] &&
            parseInt(itemClass, 10) === item_classes_1.itemClasses.classes[form.value.itemClass].class) {
            return Filters.isItemSubclassMatch(itemID, item_classes_1.itemClasses.classes[form.value.itemClass], form);
        }
        return false;
    }
    static isItemSubclassMatch(itemID, subClasses, form) {
        const subClass = shared_service_1.SharedService.items[itemID] ? shared_service_1.SharedService.items[itemID].itemSubClass : -1;
        if (form.value.itemSubClass === null || form.value.itemSubClass === -1 ||
            form.value.itemSubClass === '-1' || form.value.itemSubClass === undefined) {
            return true;
        }
        else {
            if (!subClasses.subclasses[form.value.itemSubClass]) {
                form.controls['itemSubClass'].setValue('-1');
                return true;
            }
            return subClass > -1 ?
                subClasses.subclasses[form.value.itemSubClass].subclass === parseInt(subClass, 10) : false;
        }
    }
    static isUsingAPI() {
        return shared_service_1.SharedService.user.apiToUse !== 'none';
    }
    /* istanbul ignore next */
    static getItemName(itemID) {
        return shared_service_1.SharedService.auctionItemsMap[itemID] ?
            shared_service_1.SharedService.auctionItemsMap[itemID].name : shared_service_1.SharedService.items[itemID].name;
    }
    static isExpansionMatch(itemID, form) {
        return form.value === null ||
            form.value === undefined ||
            form.value === shared_service_1.SharedService.items[itemID].expansionId;
    }
}
exports.Filters = Filters;
//# sourceMappingURL=filtering.js.map