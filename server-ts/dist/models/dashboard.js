"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
const notification_1 = require("./user/notification");
const gold_pipe_1 = require("../pipes/gold.pipe");
class Dashboard {
    constructor(title, type, array) {
        this.columns = new Array();
        this.data = new Array();
        this.isCrafting = false;
        this.title = title;
        this.idParam = 'name';
        const sellerColumns = [
            { key: 'name', title: 'Name', dataType: 'name' },
            { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
            { key: 'volume', title: 'Volume', dataType: 'number' },
            { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
        ], crafterColumns = [
            { key: 'name', title: 'Name', dataType: 'name' },
            { key: 'rank', title: 'Rank', dataType: '' },
            { key: 'buyout', title: 'Buyout', dataType: 'gold' },
            { key: 'roi', title: 'Profit', dataType: 'gold' },
            { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        switch (type) {
            case Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS:
                this.columns = sellerColumns;
                this.groupSellersByAuctions();
                break;
            case Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS_FOR_CLASS:
                this.columns = sellerColumns;
                this.groupSellersByVolume(array);
                break;
            case Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY:
                this.columns = sellerColumns;
                this.groupSellerByLiquidity();
                break;
            case Dashboard.TYPES.TOP_SELLERS_BY_VOLUME:
                this.columns = sellerColumns;
                this.groupSellersByVolume(shared_service_1.SharedService.sellers);
                break;
            case Dashboard.TYPES.MOST_AVAILABLE_ITEMS:
                this.idParam = 'itemID';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'quantityTotal', title: 'Stock', dataType: 'number' },
                    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
                ];
                this.addAPIColumnsAtPosition(3);
                this.groupItemsByAvailability();
                break;
            case Dashboard.TYPES.PROFITABLE_CRAFTS:
                this.idParam = 'itemID';
                this.columns = crafterColumns;
                this.addAPIColumnsAtPosition(4);
                this.sortCraftsByRoi(false);
                break;
            case Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS:
                this.idParam = 'itemID';
                this.columns = crafterColumns;
                this.isCrafting = true;
                this.addAPIColumnsAtPosition(4);
                this.sortCraftsByRoi(true);
                break;
            case Dashboard.TYPES.POTENTIAL_DEALS:
                this.idParam = 'itemID';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
                    { key: 'bid', title: 'Bid', dataType: 'gold' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
                ];
                this.addAPIColumnsAtPosition(3);
                this.setPotentialDeals();
                break;
            case Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT:
                this.idParam = 'item';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
                    { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item', hideOnMobile: true },
                    { key: 'roi', title: 'Profit', dataType: 'gold' },
                    { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold', hideOnMobile: true },
                    { key: 'quantity', title: 'Size', dataType: 'number' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
                ];
                this.addAPIColumnsAtPosition(5);
                this.setCheapBidsWithLowTimeLeft();
                break;
            case Dashboard.TYPES.CHEAP_BIDS:
                this.idParam = 'item';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
                    { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item', hideOnMobile: true },
                    { key: 'roi', title: 'Profit', dataType: 'gold' },
                    { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold', hideOnMobile: true },
                    { key: 'quantity', title: 'Size', dataType: 'number' },
                    { key: 'timeLeft', title: 'Time left', dataType: 'time-left' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
                ];
                this.addAPIColumnsAtPosition(5);
                this.setCheapBids();
                break;
            case Dashboard.TYPES.WATCH_LIST:
                this.idParam = 'itemID';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
                    { key: 'criteria', title: 'Criteria', dataType: '' },
                    { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
                ];
                this.addAPIColumnsAtPosition(3);
                this.setWatchListAlerts();
                break;
            case Dashboard.TYPES.WATCH_LIST_CRAFTS:
                this.idParam = 'itemID';
                this.columns = crafterColumns;
                this.isCrafting = true;
                this.addAPIColumnsAtPosition(4);
                this.setWatchListCraftingAlerts();
                break;
            case Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL:
                this.idParam = 'itemID';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
                    { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold' },
                    { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
                ];
                this.addAPIColumnsAtPosition(3);
                this.setCheaperThanVendorSell();
                break;
            case Dashboard.TYPES.TRADE_VENDOR_VALUES:
                this.idParam = 'itemID';
                this.columns = [
                    { key: 'name', title: 'Name', dataType: 'name' },
                    { key: 'bestValueName', title: 'Target', dataType: 'name' },
                    { key: 'value', title: 'Value', dataType: 'gold' }
                ];
                this.setTradeVendorValues();
                break;
        }
    }
    static addDashboards() {
        shared_service_1.SharedService.itemDashboards = new Array();
        shared_service_1.SharedService.sellerDashboards = new Array();
        // Items
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Profitable crafts', Dashboard.TYPES.PROFITABLE_CRAFTS));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Profitable known crafts', Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Watchlist alerts', Dashboard.TYPES.WATCH_LIST));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Watchlist craft alerts', Dashboard.TYPES.WATCH_LIST_CRAFTS));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Items by availability', Dashboard.TYPES.MOST_AVAILABLE_ITEMS));
        if (shared_service_1.SharedService.user.apiToUse !== 'none') {
            shared_service_1.SharedService.itemDashboards.push(new Dashboard('Potential deals', Dashboard.TYPES.POTENTIAL_DEALS));
        }
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Potential bid deals', Dashboard.TYPES.CHEAP_BIDS));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Potential 30 minute bid deals', Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Buyout below vendor sell price', Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL));
        shared_service_1.SharedService.itemDashboards.push(new Dashboard('Trade vendor currency in gold', Dashboard.TYPES.TRADE_VENDOR_VALUES));
        // Sellers
        shared_service_1.SharedService.sellerDashboards.push(new Dashboard('Top sellers by liquidity', Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY));
        shared_service_1.SharedService.sellerDashboards.push(new Dashboard('Top sellers by volume', Dashboard.TYPES.TOP_SELLERS_BY_VOLUME));
        shared_service_1.SharedService.sellerDashboards.push(new Dashboard('Top sellers by active auctions', Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS));
        shared_service_1.SharedService.sellersByItemClass.forEach(c => {
            shared_service_1.SharedService.sellerDashboards.push(new Dashboard(`Top sellers by volume for the item class ${c.name}`, Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS_FOR_CLASS, c.sellers));
        });
    }
    addAPIColumnsAtPosition(index) {
        if (shared_service_1.SharedService.user.apiToUse !== 'none') {
            this.columns.splice(index, 0, { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true });
            this.columns.splice(index, 0, { key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true });
            this.columns.splice(index, 0, { key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true });
        }
    }
    setTradeVendorValues() {
        this.data.length = 0;
        Object.keys(shared_service_1.SharedService.tradeVendorItemMap)
            .forEach(key => {
            this.data.push(shared_service_1.SharedService.tradeVendorItemMap[key]);
        });
        this.data.sort((a, b) => b.value - a.value);
    }
    setWatchListAlerts() {
        this.data.length = 0;
        this.tsmShoppingString = '';
        const pipe = new gold_pipe_1.GoldPipe();
        shared_service_1.SharedService.user.watchlist.groups.forEach(group => {
            group.items.forEach(item => {
                if (shared_service_1.SharedService.user.watchlist.isTargetMatch(item)) {
                    const wlVal = shared_service_1.SharedService.user.watchlist.getTSMStringValues(item), obj = { itemID: item.itemID, name: item.name, criteria: this.getWatchlistString(item, wlVal) };
                    this.data.push(obj);
                    if (wlVal.left > 0 && wlVal.right > 0 && item.criteria === 'below') {
                        this.tsmShoppingString += `${item.name}/exact`;
                        if (item.targetType !== 'quantity') {
                            this.tsmShoppingString += `/${pipe.transform(wlVal.left).replace(',', '')}/${pipe.transform(wlVal.right).replace(',', '')}`;
                        }
                        this.tsmShoppingString += ';';
                    }
                }
            });
        });
        if (this.data.length > 0) {
            if (this.tsmShoppingString.endsWith(';')) {
                this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
            }
            shared_service_1.SharedService.notifications.unshift(new notification_1.Notification('Watchlist', `${this.data.length} of your items were matched`));
        }
    }
    getWatchlistString(item, watchlistValue) {
        const p = new gold_pipe_1.GoldPipe();
        let criteria, value;
        switch (item.criteria) {
            case 'below':
                criteria = '<';
                break;
            case 'equal':
                criteria = '=';
                break;
            case 'above':
                criteria = '>';
                break;
        }
        switch (item.targetType) {
            case 'quantity':
                value = `${item.value} pcs`;
                break;
            case 'gold':
            case 'percent':
                value = `${p.transform(watchlistValue.left === 1 ? watchlistValue.right : watchlistValue.left)}`;
                break;
        }
        return `${criteria} ${value}`;
    }
    setWatchListCraftingAlerts() {
        this.data.length = 0;
        this.tsmShoppingString = '';
        const pipe = new gold_pipe_1.GoldPipe();
        shared_service_1.SharedService.user.watchlist.groups.forEach(group => {
            group.items.forEach(item => {
                if (shared_service_1.SharedService.recipesMapPerItemKnown[item.itemID] && shared_service_1.SharedService.recipesMapPerItemKnown[item.itemID].roi > 0) {
                    this.data.push(shared_service_1.SharedService.recipesMapPerItemKnown[item.itemID]);
                }
            });
        });
        if (this.data.length > 0) {
            this.sortByROI();
            shared_service_1.SharedService.notifications.unshift(new notification_1.Notification('Watchlist', `${this.data.length} of your items were matched by crafting ROI`));
        }
    }
    setCheaperThanVendorSell() {
        let value = 0, mvValue = 0;
        const pipe = new gold_pipe_1.GoldPipe();
        this.data.length = 0;
        this.tsmShoppingString = '';
        this.data = shared_service_1.SharedService.auctionItems.filter(ai => {
            if (ai.buyout !== 0 && ai.buyout < ai.vendorSell) {
                value += ai.vendorSell - ai.buyout;
                if (shared_service_1.SharedService.user.apiToUse !== 'none') {
                    mvValue += ai.mktPrice - ai.vendorSell;
                }
                this.tsmShoppingString += `${ai.name}/exact/1c/${pipe.transform(ai.vendorSell).replace(',', '')};`;
                return true;
            }
            return false;
        }).sort((a, b) => (b.vendorSell - b.buyout) - (a.vendorSell - a.buyout));
        if (this.data.length > 0) {
            if (this.tsmShoppingString.endsWith(';')) {
                this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
            }
            this.message = `Profit if vendored: ${pipe.transform(value)}`;
            if (shared_service_1.SharedService.user.apiToUse !== 'none') {
                this.message += `. Profit if resold at MV: ${pipe.transform(mvValue)}`;
            }
            shared_service_1.SharedService.notifications.unshift(new notification_1.Notification('Items below vendor sell', `${this.data.length} items can give you a profit of ${pipe.transform(value)}`));
        }
    }
    setCheapBidsWithLowTimeLeft() {
        let sumROI = 0;
        const pipe = new gold_pipe_1.GoldPipe();
        this.data.length = 0;
        shared_service_1.SharedService.auctions.forEach(a => {
            let match = true;
            if (a.timeLeft !== 'SHORT') {
                match = false;
            }
            if (match && (a.buyout === 0 || (a.bid / a.quantity) / shared_service_1.SharedService.auctionItemsMap[a.item].buyout > 0.9)) {
                match = false;
            }
            if (match && shared_service_1.SharedService.user.apiToUse !== 'none' &&
                shared_service_1.SharedService.auctionItemsMap[a.item].avgDailySold < 1 && shared_service_1.SharedService.auctionItemsMap[a.item].regionSaleRate < 0.30) {
                match = false;
            }
            if (match) {
                a.roi = shared_service_1.SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid;
                sumROI += a.roi;
                this.data.push(a);
            }
        });
        if (this.data.length > 0) {
            this.sortByROI();
            this.message = `Sum potential ROI: ${pipe.transform(sumROI)}`;
        }
    }
    setCheapBids() {
        let sumROI = 0;
        const pipe = new gold_pipe_1.GoldPipe();
        this.data.length = 0;
        shared_service_1.SharedService.auctions.forEach(a => {
            let match = true;
            if (match && (a.buyout === 0 || (a.bid / a.quantity) / shared_service_1.SharedService.auctionItemsMap[a.item].buyout > 0.9)) {
                match = false;
            }
            if (match && shared_service_1.SharedService.user.apiToUse !== 'none' &&
                shared_service_1.SharedService.auctionItemsMap[a.item].avgDailySold < 1 && shared_service_1.SharedService.auctionItemsMap[a.item].regionSaleRate < 0.30) {
                match = false;
            }
            if (match) {
                a.roi = shared_service_1.SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid;
                sumROI += a.roi;
                this.data.push(a);
            }
        });
        if (this.data.length > 0) {
            this.sortByROI();
            this.message = `Sum potential ROI: ${pipe.transform(sumROI)}`;
        }
    }
    setPotentialDeals() {
        const pipe = new gold_pipe_1.GoldPipe();
        this.data.length = 0;
        this.tsmShoppingString = '';
        this.data = shared_service_1.SharedService.auctionItems.filter(ai => {
            if (ai.avgDailySold > 1 && ai.regionSaleRate > 0.30 && ai.buyout / ai.mktPrice < 0.15) {
                this.tsmShoppingString += `${ai.name}/exact/1c/${pipe.transform(ai.mktPrice * 0.149).replace(',', '')};`;
                return true;
            }
            return false;
        }).sort((a, b) => a.buyout / a.mktPrice - b.buyout / b.mktPrice);
        if (this.tsmShoppingString.length > 0 && this.tsmShoppingString.endsWith(';')) {
            this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
        }
    }
    sortCraftsByRoi(onlyKnown) {
        let sumROI = 0;
        const pipe = new gold_pipe_1.GoldPipe();
        this.data.length = 0;
        this.data = shared_service_1.SharedService.recipes
            .sort((a, b) => {
            return b.roi - a.roi;
        })
            .filter(recipe => {
            if (recipe.roi <= 0 || recipe.cost <= 0) {
                return false;
            }
            if (onlyKnown && !shared_service_1.SharedService.recipesForUser[recipe.spellID] && recipe.profession) {
                return false;
            }
            if (shared_service_1.SharedService.user.apiToUse !== 'none') {
                if (recipe.avgDailySold < 1 || recipe.regionSaleRate <= 0.10) {
                    return false;
                }
            }
            sumROI += recipe.roi;
            return true;
        });
        if (this.data.length > 0) {
            this.message = `Crafting 1 of each may yeild a ROI of ${pipe.transform(sumROI)}`;
        }
    }
    groupSellersByAuctions() {
        this.data.length = 0;
        shared_service_1.SharedService.sellers.forEach(s => this.data.push(s));
        this.data.sort((a, b) => b.auctions.length - a.auctions.length);
    }
    groupSellersByVolume(sellers) {
        this.data.length = 0;
        sellers.forEach(s => this.data.push(s));
        this.data.sort((a, b) => b.volume - a.volume);
    }
    groupItemsByAvailability() {
        this.data.length = 0;
        this.data = shared_service_1.SharedService.auctionItems.
            sort((a, b) => b.quantityTotal - a.quantityTotal);
    }
    groupSellerByLiquidity() {
        this.data.length = 0;
        shared_service_1.SharedService.sellers.forEach(s => this.data.push(s));
        this.data.sort((a, b) => b.liquidity - a.liquidity);
    }
    sortByROI() {
        this.data.sort((a, b) => b.roi - a.roi);
    }
}
Dashboard.TYPES = {
    TOP_SELLERS_BY_AUCTIONS_FOR_CLASS: 'TOP_SELLERS_BY_AUCTIONS_FOR_CLASS',
    TOP_SELLERS_BY_AUCTIONS: 'TOP_SELLERS_BY_AUCTIONS',
    TOP_SELLERS_BY_VOLUME: 'TOP_SELLERS_BY_VOLUME',
    TOP_SELLERS_BY_LIQUIDITY: 'TOP_SELLERS_BY_LIQUIDITY',
    MOST_AVAILABLE_ITEMS: 'AVAILABLE_ITEMS',
    PROFITABLE_CRAFTS: 'PROFITABLE_CRAFTS',
    PROFITABLE_KNOWN_CRAFTS: 'MOST_PROFITABLE_KNOWN_CRAFTS',
    POTENTIAL_DEALS: 'POTENTIAL_DEALS',
    CHEAP_BIDS_WITH_LOW_TIME_LEFT: 'CHEAP_BIDS_WITH_LOW_TIME_LEFT',
    CHEAP_BIDS: 'CHEAP_BIDS',
    CHEAPER_THAN_VENDOR_SELL: 'CHEAPER_THAN_VENDOR_SELL',
    TRADE_VENDOR_VALUES: 'TRADE_VENDOR_VALUES',
    WATCH_LIST: 'WATCH_LIST',
    WATCH_LIST_CRAFTS: 'WATCH_LIST_CRAFTS',
    // The users pets, that maybe could be sold for something
    POSSIBLE_PROFIT_FROM_PETS: 'POSSIBLE_PROFIT_FROM_PETS'
};
exports.Dashboard = Dashboard;
//# sourceMappingURL=dashboard.js.map