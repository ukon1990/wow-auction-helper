import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';
import { Item } from './item/item';
import { Notification } from './user/notification';
import { GoldPipe } from '../pipes/gold.pipe';
import { WatchlistItem } from './watchlist/watchlist';
import { itemClasses } from './item/item-classes';
import { Seller } from './seller';

export class Dashboard {
  public static readonly TYPES = {
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

  idParam: string;
  title: string;
  tsmShoppingString: string;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<any> = new Array<any>();
  message: string;
  isCrafting = false;

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
        { key: 'roi', title: 'ROI', dataType: 'gold' },
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
          { key: 'regionSaleAvg', title: 'Avg sale price', dataType: 'gold' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.addAPIColumnsAtPosition(4);
        this.setPotentialDeals();
        break;

      case Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT:
        this.idParam = 'item';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
          { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item', hideOnMobile: true },
          { key: 'roi', title: 'ROI', dataType: 'gold' },
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
          { key: 'roi', title: 'ROI', dataType: 'gold' },
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

  public static addDashboards(): void {
    SharedService.itemDashboards = new Array<Dashboard>();
    SharedService.sellerDashboards = new Array<Dashboard>();

    // Items
    SharedService.itemDashboards.push(
      new Dashboard('Profitable crafts', Dashboard.TYPES.PROFITABLE_CRAFTS));
    SharedService.itemDashboards.push(
      new Dashboard('Profitable known crafts', Dashboard.TYPES.PROFITABLE_KNOWN_CRAFTS));
    SharedService.itemDashboards.push(
      new Dashboard('Watchlist alerts', Dashboard.TYPES.WATCH_LIST));
    SharedService.itemDashboards.push(
      new Dashboard('Watchlist craft alerts', Dashboard.TYPES.WATCH_LIST_CRAFTS));
    SharedService.itemDashboards.push(
      new Dashboard('Items by availability', Dashboard.TYPES.MOST_AVAILABLE_ITEMS));
    if (SharedService.user.apiToUse !== 'none') {
      SharedService.itemDashboards.push(
        new Dashboard('Potential deals', Dashboard.TYPES.POTENTIAL_DEALS));
    }
    SharedService.itemDashboards.push(
      new Dashboard('Potential bid deals', Dashboard.TYPES.CHEAP_BIDS));
    SharedService.itemDashboards.push(
      new Dashboard('Potential 30 minute bid deals', Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT));
    SharedService.itemDashboards.push(
      new Dashboard('Buyout below vendor sell price', Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL));
    SharedService.itemDashboards.push(
      new Dashboard('Trade vendor currency in gold', Dashboard.TYPES.TRADE_VENDOR_VALUES));

    // Sellers
    SharedService.sellerDashboards.push(
      new Dashboard('Top sellers by liquidity', Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY));
    SharedService.sellerDashboards.push(
      new Dashboard('Top sellers by volume', Dashboard.TYPES.TOP_SELLERS_BY_VOLUME));

    SharedService.sellerDashboards.push(
      new Dashboard('Top sellers by active auctions', Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS));

    SharedService.sellersByItemClass.forEach(c => {
      SharedService.sellerDashboards.push(
        new Dashboard(`Top sellers by volume for the item class ${c.name}`,
          Dashboard.TYPES.TOP_SELLERS_BY_AUCTIONS_FOR_CLASS, c.sellers));
    });
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
        this.data.push(SharedService.tradeVendorItemMap[key]);
      });
    this.data.sort((a, b) => b.value - a.value);
  }

  private setWatchListAlerts(): void {
    this.data.length = 0;
    this.tsmShoppingString = '';
    const pipe = new GoldPipe();

    SharedService.user.watchlist.groups.forEach(group => {
      group.items.forEach(item => {
        if (SharedService.user.watchlist.isTargetMatch(item)) {
          const wlVal = SharedService.user.watchlist.getTSMStringValues(item),
            obj = { itemID: item.itemID, name: item.name, criteria: this.getWatchlistString(item, wlVal) };
          this.data.push(obj);
          if (wlVal.left > 0 && wlVal.right > 0) {
            this.tsmShoppingString += `${item.name}/exact/${pipe.transform(wlVal.left)}/${pipe.transform(wlVal.right)};`;
          }
        }
      });
    });
    if (this.data.length > 0) {
      if (this.tsmShoppingString.endsWith(';')) {
        this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
      }
      SharedService.notifications.unshift(
        new Notification('Watchlist', `${this.data.length} of your items were matched`));
    }
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
        value = `${ item.value } pcs`;
        break;
        case 'gold':
      case 'percent':
        value = `${ p.transform(
          watchlistValue.left === 1 ? watchlistValue.right : watchlistValue.left ) }`;
        break;
    }
    return `${ criteria } ${ value }`;
  }

  private setWatchListCraftingAlerts(): void {
    this.data.length = 0;
    this.tsmShoppingString = '';
    const pipe = new GoldPipe();

    SharedService.user.watchlist.groups.forEach(group => {
      group.items.forEach(item => {
        if (SharedService.recipesMapPerItemKnown[item.itemID] && SharedService.recipesMapPerItemKnown[item.itemID].roi > 0) {
          this.data.push(SharedService.recipesMapPerItemKnown[item.itemID]);
        }
      });
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
      if (ai.buyout !== 0 && ai.buyout < ai.vendorSell) {
        value += ai.vendorSell - ai.buyout;
        if (SharedService.user.apiToUse !== 'none') {
          mvValue += ai.mktPrice - ai.vendorSell;
        }
        this.tsmShoppingString += `${ai.name}/exact/1c/${pipe.transform(ai.vendorSell)};`;
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
      if (a.timeLeft !== 'SHORT') {
        match = false;
      }

      if (match && (a.buyout === 0 || (a.bid / a.quantity) / SharedService.auctionItemsMap[a.item].buyout > 0.9)) {
        match = false;
      }

      if (match && SharedService.user.apiToUse !== 'none' &&
        SharedService.auctionItemsMap[a.item].avgDailySold < 1 && SharedService.auctionItemsMap[a.item].regionSaleRate < 0.30) {
        match = false;
      }

      if (match) {
        a.roi = SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid;
        sumROI += a.roi;
        this.data.push(a);
      }
    });

    if (this.data.length > 0) {
      this.sortByROI();
      this.message = `Sum potential ROI: ${ pipe.transform(sumROI) }`;
    }
  }

  private setCheapBids(): void {
    let sumROI = 0;
    const pipe: GoldPipe = new GoldPipe();
    this.data.length = 0;
    SharedService.auctions.forEach(a => {
      let match = true;

      if (match && (a.buyout === 0 || (a.bid / a.quantity) / SharedService.auctionItemsMap[a.item].buyout > 0.9)) {
        match = false;
      }

      if (match && SharedService.user.apiToUse !== 'none' &&
        SharedService.auctionItemsMap[a.item].avgDailySold < 1 && SharedService.auctionItemsMap[a.item].regionSaleRate < 0.30) {
        match = false;
      }

      if (match) {
        a.roi = SharedService.auctionItemsMap[a.item].buyout * a.quantity - a.bid;
        sumROI += a.roi;
        this.data.push(a);
      }
    });

    if (this.data.length > 0) {
      this.sortByROI();
      this.message = `Sum potential ROI: ${ pipe.transform(sumROI) }`;
    }
  }

  private setPotentialDeals(): void {
    const pipe = new GoldPipe();
    this.data.length = 0;
    this.tsmShoppingString = '';

    this.data = SharedService.auctionItems.filter(ai => {
      if (ai.avgDailySold > 1 && ai.regionSaleRate > 0.30 && ai.buyout / ai.mktPrice < 0.15 && ai.buyout / ai.regionSaleAvg < 0.15) {
        this.tsmShoppingString += `${ai.name}/exact/1c/${pipe.transform(ai.mktPrice * 0.149)};`;
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
      .sort((a, b) => {
        return b.roi - a.roi;
      })
      .filter(recipe => {
        if (recipe.roi <= 0 || recipe.cost <= 0) {
          return false;
        }
        if (onlyKnown  && !SharedService.recipesForUser[recipe.spellID] && recipe.profession) {
          return false;
        }
        if (SharedService.user.apiToUse !== 'none') {
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
    this.data.sort( (a, b) =>
      b.roi - a.roi);
  }
}
