"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
const default_watchlist_1 = require("./default-watchlist");
const dashboard_1 = require("../dashboard");
class Watchlist {
    constructor() {
        this.storageName = 'watchlist';
        this.COMPARABLE_VARIABLES = {
            BUYOUT: 'buyout',
            BID: 'bid',
            MARKET_VALUE: 'mktPrice',
            AVG_DAILY_SOLD: 'avgDailySold',
            REGIONAL_AVG_SALE_PRICE: 'regionSaleAvg',
            REGIONAL_SALE_RATE: 'regionSaleRate',
            QUANTITY_TOTAL: 'quantityTotal'
        };
        this.CRITERIA = {
            BELOW: 'below',
            EQUAL: 'equal',
            ABOVE: 'above'
        };
        this.TARGET_TYPES = {
            PERCENT: 'percent',
            GOLD: 'gold',
            QUANTITY: 'quantity'
        };
        this.groups = new Array();
        this.groupsMap = new Map();
        this.restore();
    }
    restore() {
        let shouldSave = false;
        if (localStorage[this.storageName] !== undefined) {
            const wl = JSON.parse(localStorage[this.storageName]);
            shouldSave = this.restoreFrom(wl);
        }
        else {
            this.groups = default_watchlist_1.defaultWatchlist;
        }
        if (shouldSave) {
            this.save();
        }
    }
    restoreFrom(wl) {
        let shouldSave = false;
        if (wl.items) {
            wl.groups = [];
            Object.keys(wl.items).forEach(group => {
                const g = new WatchlistGroup(group);
                wl.items[group].forEach(item => {
                    if (item) {
                        g.items.push(this.mapOldVersionToNew(item));
                    }
                });
                wl.groups.push(g);
            });
            shouldSave = true;
        }
        console.log(wl);
        if (wl.groups) {
            this.groups = wl.groups;
            this.groups.forEach(g => {
                if (!this.groupsMap[g.name]) {
                    this.groupsMap[g.name] = new WatchlistGroup(g.name);
                }
                this.groupsMap[g.name].items.push(g);
            });
        }
        return shouldSave;
    }
    isTargetMatch(item) {
        if (!shared_service_1.SharedService.auctionItemsMap[item.itemID]) {
            return false;
        }
        switch (item.criteria) {
            case this.CRITERIA.BELOW:
                return this.getTypeValue(item) < item.value;
            case this.CRITERIA.EQUAL:
                return this.getTypeValue(item) === item.value;
            case this.CRITERIA.ABOVE:
                return this.getTypeValue(item) > item.value;
        }
        return false;
    }
    getTypeValue(item) {
        switch (item.targetType) {
            case this.TARGET_TYPES.QUANTITY:
                return shared_service_1.SharedService.auctionItemsMap[item.itemID][item.compareTo];
            case this.TARGET_TYPES.GOLD:
                return shared_service_1.SharedService.auctionItemsMap[item.itemID][item.compareTo];
            case this.TARGET_TYPES.PERCENT:
                return shared_service_1.SharedService.auctionItemsMap[item.itemID].buyout /
                    shared_service_1.SharedService.auctionItemsMap[item.itemID][item.compareTo] * 100;
        }
        return 0;
    }
    getTypeValueInGold(item) {
        switch (item.targetType) {
            case this.TARGET_TYPES.GOLD:
                return item.value;
            case this.TARGET_TYPES.PERCENT:
                return shared_service_1.SharedService.auctionItemsMap[item.itemID][item.compareTo] * item.value / 100;
        }
        return 0;
    }
    getTSMStringValues(item) {
        switch (item.criteria) {
            case this.CRITERIA.BELOW:
                return { left: 1, right: this.getTypeValueInGold(item) };
            case this.CRITERIA.EQUAL:
                return { left: this.getTypeValueInGold(item), right: this.getTypeValueInGold(item) };
            case this.CRITERIA.ABOVE:
                return { left: this.getTypeValueInGold(item), right: 99999999999 };
        }
        return { left: 0, right: 0 };
    }
    addGroup(name) {
        if (this.groupsMap[name]) {
            return;
        }
        this.groupsMap[name] = new WatchlistGroup(name);
        this.groups.push(this.groupsMap[name]);
    }
    moveItem(fromGroup, toGroup, index) {
        toGroup.items.push(fromGroup.items[index]);
        this.removeItem(fromGroup, index);
    }
    addItem(group, watchlistItem) {
        group.items.push(watchlistItem);
        this.save();
    }
    removeItem(group, index) {
        group.items.splice(index, 1);
        this.save();
    }
    removeGroup(index) {
        this.groups.splice(index, 1);
        this.save();
    }
    attemptRestoreFromString(stringObj) {
        const tmpObj = JSON.parse(stringObj);
        if (tmpObj['watchlist']) {
            shared_service_1.SharedService.user.watchlist.restoreFrom(tmpObj['watchlist']);
            shared_service_1.SharedService.user.watchlist.save();
        }
    }
    save() {
        localStorage[this.storageName] = JSON.stringify({ groups: this.groups });
        dashboard_1.Dashboard.addDashboards();
    }
    mapOldVersionToNew(item) {
        return {
            itemID: parseInt(item.id, 10),
            name: item.name,
            compareTo: item.compareTo,
            value: item.value,
            target: 0,
            targetType: this.TARGET_TYPES.GOLD,
            criteria: item.criteria,
            minCraftingProfit: item.minCraftingProfit ? item.minCraftingProfit : 0
        };
    }
}
exports.Watchlist = Watchlist;
class WatchlistGroup {
    constructor(name, items) {
        this.items = new Array();
        this.name = name;
        if (items) {
            this.items = items;
        }
    }
}
exports.WatchlistGroup = WatchlistGroup;
class WatchlistItem {
    constructor(itemID) {
        this.value = 0;
        itemID = parseInt(itemID, 10);
        if (itemID && shared_service_1.SharedService.items[itemID]) {
            const wl = shared_service_1.SharedService.user.watchlist;
            this.itemID = itemID;
            this.name = shared_service_1.SharedService.items[itemID].name;
            this.compareTo = wl.COMPARABLE_VARIABLES.BUYOUT;
            this.targetType = wl.TARGET_TYPES.GOLD;
            this.criteria = wl.CRITERIA.BELOW;
            this.minCraftingProfit = 0;
        }
    }
}
exports.WatchlistItem = WatchlistItem;
//# sourceMappingURL=watchlist.js.map