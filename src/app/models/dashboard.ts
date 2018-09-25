import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';
import { Item } from './item/item';
import { Notification } from './user/notification';
import { GoldPipe } from '../pipes/gold.pipe';
import { WatchlistItem, WatchlistGroup } from './watchlist/watchlist';
import { itemClasses } from './item/item-classes';
import { Seller } from './seller';
import { AuctionItem } from './auction/auction-item';
import { Filters } from './filtering';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Remains } from './item/remains.model';
import { ProspectingAndMillingUtil } from '../utils/prospect-milling.util';
import { EventEmitter } from '@angular/core';
import { DefaultDashboardSettings } from './dashboard/default-dashboard-settings.model';
import { Crafting } from './crafting/crafting';

export class Dashboard {
  public static readonly TYPES = {
    TOP_SELLERS_BY_AUCTIONS_FOR_CLASS: 'DASHBOARD_TOP_SELLERS_BY_AUCTIONS_FOR_CLASS',
    TOP_SELLERS_BY_AUCTIONS: 'DASHBOARD_TOP_SELLERS_BY_AUCTIONS',
    TOP_SELLERS_BY_VOLUME: 'DASHBOARD_TOP_SELLERS_BY_VOLUME',
    TOP_SELLERS_BY_LIQUIDITY: 'DASHBOARD_TOP_SELLERS_BY_LIQUIDITY',
    MOST_AVAILABLE_ITEMS: 'DASHBOARD_AVAILABLE_ITEMS',
    PROFITABLE_CRAFTS: 'DASHBOARD_PROFITABLE_CRAFTS',
    PROFITABLE_KNOWN_CRAFTS: 'DASHBOARD_MOST_PROFITABLE_KNOWN_CRAFTS',
    POTENTIAL_DEALS: 'DASHBOARD_POTENTIAL_DEALS',
    CHEAP_BIDS_WITH_LOW_TIME_LEFT: 'DASHBOARD_CHEAP_BIDS_WITH_LOW_TIME_LEFT',
    CHEAP_BIDS: 'DASHBOARD_CHEAP_BIDS',
    CHEAPER_THAN_VENDOR_SELL: 'DASHBOARD_CHEAPER_THAN_VENDOR_SELL',
    TRADE_VENDOR_VALUES: 'DASHBOARD_TRADE_VENDOR_VALUES',
    WATCH_LIST: 'DASHBOARD_WATCH_LIST',
    WATCH_LIST_CRAFTS: 'DASHBOARD_WATCH_LIST_CRAFTS',
    PROSPECTING: 'DASHBOARD_PROSPECTING',
    MILLING: 'DASHBOARD_MILLING',
    // The users pets, that maybe could be sold for something
    POSSIBLE_PROFIT_FROM_PETS: 'DASHBOARD_POSSIBLE_PROFIT_FROM_PETS'
  };

  public static itemEvents: EventEmitter<Dashboard[]> = new EventEmitter(true);
  public static sellerEvents: EventEmitter<Dashboard[]> = new EventEmitter(true);

  idParam: string;
  title: string;
  tsmShoppingString: string;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<any> = new Array<any>();
  message: string;
  isCrafting = false;
  isDisabled = false;
  settings?: DefaultDashboardSettings;

  constructor(title: string, type: string, array?: Array<any>) {
    this.title = title;
    this.idParam = 'name';
    const sellerColumns = [
      { key: 'name', title: 'Name', dataType: 'name' },
      { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
      { key: 'volume', title: 'Volume', dataType: 'number' },
      { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
    ],
      crafterColumns = [
        { key: 'name', title: 'Name', dataType: 'name' },
        { key: 'rank', title: 'Rank', dataType: '' },
        { key: 'buyout', title: 'Buyout', dataType: 'gold' },
        { key: 'roi', title: 'Profit', dataType: 'gold' },
        { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
      ];
    this.settings = SharedService.defaultDashboardSettingsListMap[type];
    if (this.settings) {
      this.isDisabled = this.settings.isDisabled;
    }

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
        this.groupSellersByVolume(SharedService.sellers);
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
          { key: 'buyout', title: 'Min buyout/item', dataType: 'gold-per-item', hideOnMobile: true },
          { key: 'roi', title: 'Profit', dataType: 'gold' },
          { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold', hideOnMobile: true },
          { key: 'quantity', title: 'Size', dataType: 'number' },
          { key: 'timeLeft', title: 'Time left', dataType: 'time-left' },
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
          { key: 'buyout', title: 'Min buyout/item', dataType: 'gold-per-item', hideOnMobile: true },
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
          { key: 'compareTo', title: 'Compared to', dataType: '' },
          { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true }
        ];
        this.addAPIColumnsAtPosition(4);
        this.setWatchListAlerts(array[0]);
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
      case Dashboard.TYPES.MILLING:
        this.idParam = 'id';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'yield', title: 'Profit', dataType: 'gold' }

        ];
        this.shuffles(ProspectingAndMillingUtil.mills);
        break;
      case Dashboard.TYPES.PROSPECTING:
        this.idParam = 'id';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'yield', title: 'Profit', dataType: 'gold' }
        ];
        this.shuffles(ProspectingAndMillingUtil.prospecting);
        break;
    }
  }

  public static addLoadingDashboards(): void {
    const columns = [
      { key: 'name', title: '', dataType: '' },
      { key: 'name', title: '', dataType: '' },
      { key: 'name', title: '', dataType: '' }
    ];
    SharedService.itemDashboards.length = 0;
    SharedService.sellerDashboards.length = 0;

    for (let i = 0; i < 10; i++) {
      const db = new Dashboard('', ''),
        item = new AuctionItem();

      db.idParam = 'itemID';
      item.itemID = 25;
      item.name = 'Loading..';
      db.columns = columns;
      db.data = [
        item, item, item, item, item, item, item, item, item, item
      ];
      SharedService.itemDashboards.push(db);
      SharedService.sellerDashboards.push(db);
    }
  }

  public static addDashboards(): void {
    let db: Dashboard;
    SharedService.itemDashboards.length = 0;
    SharedService.sellerDashboards.length = 0;

    // Items
    db = new Dashboard(
      SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.PROFITABLE_CRAFTS].title,
      Dashboard.TYPES.PROFITABLE_CRAFTS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }
    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS].title,
        Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.WATCH_LIST_CRAFTS].title,
        Dashboard.TYPES.WATCH_LIST_CRAFTS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    // The users watchlists
    SharedService.user.watchlist.groups.forEach(group => {
      db = new Dashboard(group.name, Dashboard.TYPES.WATCH_LIST, [group]);

      if (db.data.length > 0 && !db.isDisabled) {
        SharedService.itemDashboards.push(db);
      }
    });


    db = new Dashboard(
      SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.MILLING].title,
      Dashboard.TYPES.MILLING);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
      SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.PROSPECTING].title,
      Dashboard.TYPES.PROSPECTING);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.MOST_AVAILABLE_ITEMS].title,
        Dashboard.TYPES.MOST_AVAILABLE_ITEMS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    if (SharedService.user.apiToUse !== 'none') {
      db = new Dashboard(
          SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.POTENTIAL_DEALS].title,
          Dashboard.TYPES.POTENTIAL_DEALS);
      if (db.data.length > 0 && !db.isDisabled) {
        SharedService.itemDashboards.push(db);
      }
    }
    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.CHEAP_BIDS].title,
        Dashboard.TYPES.CHEAP_BIDS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT].title,
        Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL].title,
        Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    db = new Dashboard(
        SharedService.defaultDashboardSettingsListMap[Dashboard.TYPES.TRADE_VENDOR_VALUES].title,
        Dashboard.TYPES.TRADE_VENDOR_VALUES);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.itemDashboards.push(db);
    }

    // Sellers
    db = new Dashboard(
      'Top sellers by liquidity',
      Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.sellerDashboards.push(db);
    }

    db = new Dashboard(
      'Top sellers by volume',
      Dashboard.TYPES.TOP_SELLERS_BY_VOLUME);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.sellerDashboards.push(db);
    }

    db = new Dashboard(
      'Top sellers by active auctions',
      Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS);
    if (db.data.length > 0 && !db.isDisabled) {
      SharedService.sellerDashboards.push(db);
    }

    SharedService.sellersByItemClass.forEach(c => {
      db = new Dashboard(
        `Top sellers by volume for the item class ${c.name}`,
          Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS_FOR_CLASS, c.sellers);
      if (db.data.length > 0 && !db.isDisabled) {
        SharedService.sellerDashboards.push(db);
      }
    });

    Dashboard.itemEvents.emit(SharedService.itemDashboards);
    Dashboard.sellerEvents.emit(SharedService.sellerDashboards);
  }

  private addAPIColumnsAtPosition(index: number): void {
    if (SharedService.user.apiToUse !== 'none') {
      this.columns.splice(index, 0, { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true });
      this.columns.splice(index, 0, { key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true });
      this.columns.splice(index, 0, { key: 'mktPrice', title: 'Market value', dataType: 'gold', hideOnMobile: true });
    }
  }

  private setTradeVendorValues(): void {
    this.data.length = 0;
    Object.keys(SharedService.tradeVendorItemMap)
      .forEach(key => {
        if (!this.isExpansionMissMatch(parseInt(key, 10))) {
          this.data.push(SharedService.tradeVendorItemMap[key]);
        }
      });
    this.data.sort((a, b) => b.value - a.value);
  }

  private setWatchListAlerts(group: WatchlistGroup): void {
    this.data.length = 0;
    this.isDisabled = group.hide;
    this.tsmShoppingString = '';
    this.message = `You can edit this dashboard item, over in the "manage custom dashboards" section`;
    const pipe = new GoldPipe();
    const form = (new FormBuilder).group({
      avgDailySold: group.matchDailySold,
      saleRate: group.matchSaleRate
    });


    group.items.forEach(item => {
      if (SharedService.user.watchlist.isTargetMatch(item) &&
        Filters.isSaleRateMatch(item.itemID, form) &&
        Filters.isDailySoldMatch(item.itemID, form)) {
        const wlVal = SharedService.user.watchlist.getTSMStringValues(item),
          obj = { itemID: item.itemID, name: item.name, criteria: this.getWatchlistString(item, wlVal), compareTo: item.compareTo };
        this.data.push(obj);
        if (wlVal.left > 0 && wlVal.right > 0 && item.criteria === 'below') {
          this.tsmShoppingString += `${
            item.name
            }/exact`;
          if (item.targetType !== SharedService.user.watchlist.TARGET_TYPES.QUANTITY &&
            item.compareTo !== SharedService.user.watchlist.COMPARABLE_VARIABLES.PROFITABLE_TO_CRAFT) {
            this.tsmShoppingString += `/${
              pipe.transform(wlVal.left).replace(',', '')
              }/${
              pipe.transform(wlVal.right).replace(',', '')
              }`;
          }
          this.tsmShoppingString += ';';
        }
      }
    });
    if (this.data.length > 0) {
      if (this.tsmShoppingString.endsWith(';')) {
        this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
      }
      SharedService.notifications.unshift(
        new Notification('Watchlist', `${this.data.length} of your items were matched`));
    }
  }

  private shuffles(array: Remains[]): void {
    const pipe = new GoldPipe();
    this.data.length = 0;
    this.message = 'You can get more details about and manage these over at the tools -> Milling & Prospecting section';
    this.tsmShoppingString = '';
    this.data = array.filter(remains => {
      if (this.isExpansionMissMatch(remains.id)) {
        return false;
      }

      if (remains.yield > 0) {
        this.tsmShoppingString += `${
          remains.name
          }/exact/1c/${
          pipe.transform(remains.buyout + remains.yield).replace(',', '')
          };`;
        return true;
      }
      return false;
    }).sort((a, b) =>
      b.yield - a.yield);
  }

  private getWatchlistString(item: WatchlistItem, watchlistValue: any): string {
    const p = new GoldPipe();
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
        value = `${p.transform(
          watchlistValue.left === 1 ? watchlistValue.right : watchlistValue.left)}`;
        break;
    }
    return `${criteria} ${value}`;
  }

  private setWatchListCraftingAlerts(): void {
    this.data.length = 0;
    this.tsmShoppingString = '';
    const pipe = new GoldPipe(),
      // Using this list to avoid duplicate items
      tmpList = new Map<number, any>();

    SharedService.user.watchlist.groups.forEach(group => {
      group.items.forEach(item => {
        if (this.isExpansionMissMatch(item.itemID)) {
          return;
        }

        const recipe = SharedService.recipesMapPerItemKnown[item.itemID];
        if (recipe &&
          recipe.roi / recipe.cost >= this.settings.minROIPercent &&
          this.getAuctionItem(item.itemID).regionSaleRate >= this.settings.regionSaleRate &&
          this.getAuctionItem(item.itemID).avgDailySold >= this.settings.avgDailySold) {
          tmpList[item.itemID] = recipe;
        }
      });
    });

    Object.keys(tmpList).forEach(key => {
      this.data.push(tmpList[key]);
    });

    if (this.data.length > 0) {
      this.sortByROI();
      SharedService.notifications.unshift(
        new Notification('Watchlist', `${this.data.length} of your items were matched by crafting ROI`));
    }
  }

  private setCheaperThanVendorSell(): void {
    let value = 0, mvValue = 0;
    const pipe = new GoldPipe();
    this.data.length = 0;
    this.tsmShoppingString = '';
    this.data = SharedService.auctionItems.filter(ai => {
      if (this.isExpansionMissMatch(ai.itemID)) {
        return false;
      }

      if (ai.buyout !== 0 && ai.buyout < ai.vendorSell) {
        value += ai.vendorSell - ai.buyout;
        if (SharedService.user.apiToUse !== 'none') {
          mvValue += ai.mktPrice - ai.vendorSell;
        }
        this.tsmShoppingString += `${
          ai.name
          }/exact/1c/${
          pipe.transform(ai.vendorSell).replace(',', '')
          };`;
        return true;
      }
      return false;
    }).sort((a, b) =>
      (b.vendorSell - b.buyout) - (a.vendorSell - a.buyout));

    if (this.data.length > 0) {
      if (this.tsmShoppingString.endsWith(';')) {
        this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
      }

      this.message = `Profit if vendored: ${pipe.transform(value)}`;

      if (SharedService.user.apiToUse !== 'none') {
        this.message += `. Profit if resold at MV: ${pipe.transform(mvValue)}`;
      }

      SharedService.notifications.unshift(
        new Notification('Items below vendor sell',
          `${this.data.length} items can give you a profit of ${pipe.transform(value)}`));
    }
  }

  private setCheapBidsWithLowTimeLeft(): void {
    let sumROI = 0;
    const pipe = new GoldPipe();
    this.data.length = 0;
    SharedService.auctions.forEach(a => {
      let match = true;
      if (this.isExpansionMissMatch(a.item)) {
        match = false;
      }

      if (a.timeLeft !== 'SHORT' && a.timeLeft !== 'MEDIUM') {
        match = false;
      }

      if (match && (a.buyout === 0 ||
        (SharedService.auctionItemsMap[a.item].buyout / (a.bid / a.quantity)) * Crafting.ahCutModifier < this.settings.minROIPercent + 1)) {
        match = false;
      }

      if (match && SharedService.user.apiToUse !== 'none' &&
        SharedService.auctionItemsMap[a.item].avgDailySold < this.settings.avgDailySold &&
        SharedService.auctionItemsMap[a.item].regionSaleRate < this.settings.regionSaleRate) {
        match = false;
      }

      if (match) {
        a.roi = (SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid) * Crafting.ahCutModifier;
        sumROI += a.roi;
        this.data.push(a);
      }
    });

    if (this.data.length > 0) {
      this.sortByROI();
      this.message = `Sum potential ROI: ${pipe.transform(sumROI)}`;
    }
  }

  private setCheapBids(): void {
    let sumROI = 0;
    const pipe: GoldPipe = new GoldPipe();
    this.data.length = 0;
    SharedService.auctions.forEach(a => {
      let match = true;

      if (this.isExpansionMissMatch(a.item)) {
        match = false;
      }

      if (match && (a.buyout === 0 ||
        (SharedService.auctionItemsMap[a.item].buyout / (a.bid / a.quantity)) * Crafting.ahCutModifier < this.settings.minROIPercent + 1)) {
        match = false;
      }

      if (match && SharedService.user.apiToUse !== 'none' &&
        SharedService.auctionItemsMap[a.item].avgDailySold < this.settings.avgDailySold &&
        SharedService.auctionItemsMap[a.item].regionSaleRate < this.settings.regionSaleRate) {
        match = false;
      }

      if (match) {
        a.roi = (SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid) * Crafting.ahCutModifier;
        sumROI += a.roi;
        this.data.push(a);
      }
    });

    if (this.data.length > 0) {
      this.sortByROI();
      this.message = `Sum potential ROI: ${pipe.transform(sumROI)}`;
    }
  }

  private setPotentialDeals(): void {
    const pipe = new GoldPipe();
    this.data.length = 0;
    this.tsmShoppingString = '';

    this.data = SharedService.auctionItems.filter(ai => {
      if (this.isExpansionMissMatch(ai.itemID)) {
        return false;
      }

      if (ai.avgDailySold > this.settings.avgDailySold &&
        ai.regionSaleRate > this.settings.regionSaleRate &&
        (ai.buyout / ai.mktPrice) < this.settings.minROIPercent) {
        this.tsmShoppingString += `${
          ai.name
          }/exact/1c/${
          pipe.transform(ai.mktPrice * 0.149).replace(',', '')
          };`;
        return true;
      }
      return false;
    }).sort((a, b) =>
      a.buyout / a.mktPrice - b.buyout / b.mktPrice);

    if (this.tsmShoppingString.length > 0 && this.tsmShoppingString.endsWith(';')) {
      this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
    }
  }

  private sortCraftsByRoi(onlyKnown: boolean): void {
    let sumROI = 0;
    const pipe: GoldPipe = new GoldPipe();
    this.data.length = 0;
    this.data = SharedService.recipes
      .filter(recipe => {
        if (this.isExpansionMissMatch(recipe.itemID)) {
          return false;
        }

        if (recipe.roi / recipe.cost <= this.settings.minROIPercent) {
          return false;
        }

        if (onlyKnown && !SharedService.recipesForUser[recipe.spellID] && recipe.profession) {
          return false;
        }
        if (SharedService.user.apiToUse !== 'none') {
          if (this.getAuctionItem(recipe.itemID).avgDailySold <= this.settings.avgDailySold ||
            this.getAuctionItem(recipe.itemID).regionSaleRate <= this.settings.regionSaleRate) {
            return false;
          }
        }

        sumROI += recipe.roi;
        return true;
      })
      .sort((a, b) => {
        return b.roi - a.roi;
      });
    if (this.data.length > 0) {
      this.message = `Crafting 1 of each may yeild a ROI of ${pipe.transform(sumROI)}`;
    }
  }

  private groupSellersByAuctions(): void {
    this.data.length = 0;
    SharedService.sellers.forEach(s => this.data.push(s));
    this.data.sort((a, b) => b.auctions.length - a.auctions.length);
  }
  private groupSellersByVolume(sellers: Array<Seller>): void {
    this.data.length = 0;
    sellers.forEach(s => this.data.push(s));
    this.data.sort((a, b) => b.volume - a.volume);
  }

  private groupItemsByAvailability(): void {
    this.data.length = 0;
    this.data = SharedService.auctionItems.
      sort((a, b) => b.quantityTotal - a.quantityTotal);
  }

  private groupSellerByLiquidity(): void {
    this.data.length = 0;
    SharedService.sellers.forEach(s => this.data.push(s));
    this.data.sort((a, b) => b.liquidity - a.liquidity);
  }

  private sortByROI(): void {
    this.data.sort((a, b) =>
      b.roi - a.roi);
  }

  private isExpansionMissMatch(id: number): boolean {
    return this.settings.limitToExpansion > -1 &&
      SharedService.items[id].expansionId !== this.settings.limitToExpansion;
  }

  private getAuctionItem(id: number): AuctionItem {
    return SharedService.auctionItemsMap[id] ?
      SharedService.auctionItemsMap[id] : new AuctionItem();
  }
}
