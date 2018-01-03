import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';
import { Item } from './item/item';

export class Dashboard {
  public static readonly TYPES = {
    TOP_SELLERS_BY_VOLUME: 'TOP_SELLERS_BY_VOLUME',
    TOP_SELLERS_BY_LIQUIDITY: 'TOP_SELLERS_BY_LIQUIDITY',
    MOST_AVAILABLE_ITEMS: 'MOST_AVAILABLE_ITEMS',
    MOST_PROFITABLE_CRAFTS: 'MOST_PROFITABLE_CRAFTS',
    MOST_PROFITABLE_KNOWN_CRAFTS: 'MOST_PROFITABLE_KNOWN_CRAFTS',
    POTENTIAL_DEALS: 'POTENTIAL_DEALS',
    CHEAP_BIDS_WITH_LOW_TIME_LEFT: 'CHEAP_BIDS_WITH_LOW_TIME_LEFT',
    CHEAPER_THAN_VENDOR_SELL: 'CHEAPER_THAN_VENDOR_SELL',
    TRADE_VENDOR_VALUES: 'TRADE_VENDOR_VALUES',
    // The users pets, that maybe could be sold for something
    POSSIBLE_PROFIT_FROM_PETS: 'POSSIBLE_PROFIT_FROM_PETS'
  };

  idParam: string;
  title: string;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<any> = new Array<any>();

  constructor(title: string, type: string) {
    this.title = title;

    switch (type) {
      case Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY:
        this.columns = [
          { key: 'owner', title: 'Name', dataType: 'name' },
          { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
          { key: 'volume', title: 'Volume', dataType: 'number' },
          { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
        ];
        this.setItemsGroupedBySellerWithHighLiquidity();
        break;
      case Dashboard.TYPES.TOP_SELLERS_BY_VOLUME:
        this.columns = [
          { key: 'owner', title: 'Name', dataType: 'name' },
          { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
          { key: 'volume', title: 'Volume', dataType: 'number' },
          { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
        ];
        this.setSellersGroupedSortedByQuantity();
        break;
      case Dashboard.TYPES.MOST_AVAILABLE_ITEMS:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'quantityTotal', title: 'Stock', dataType: 'number' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.setItemsGroupedByAvailablility();
        break;
      case Dashboard.TYPES.MOST_PROFITABLE_CRAFTS:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'roi', title: 'ROI', dataType: 'gold' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.setMostProfitableProfessions(false);
        break;
      case Dashboard.TYPES.MOST_PROFITABLE_KNOWN_CRAFTS:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'roi', title: 'ROI', dataType: 'gold' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.setMostProfitableProfessions(true);
        break;
      case Dashboard.TYPES.POTENTIAL_DEALS:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'bid', title: 'Bid', dataType: 'gold' },
          { key: 'regionSaleAvg', title: 'Avg sale price', dataType: 'gold' },
          { key: 'mktPrice', title: 'Market value', dataType: 'gold' },
          { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
          { key: 'avgDailySold', title: 'Daily sold', dataType: 'number' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.setPotentialDeals();
        break;

      case Dashboard.TYPES.CHEAP_BIDS_WITH_LOW_TIME_LEFT:
        this.idParam = 'item';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item' },
          { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
          { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold' },
          { key: 'quantity', title: 'Size', dataType: 'number' },
          { key: 'mktPrice', title: 'Market value', dataType: 'gold' },
          { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
          { key: 'avgDailySold', title: 'Daily sold', dataType: 'number' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
        this.setCheapBidsWithLowTimeLeft();
        break;

      case Dashboard.TYPES.CHEAPER_THAN_VENDOR_SELL:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'vendorSell', title: 'Vendor sell', dataType: 'gold' },
          { key: 'mktPrice', title: 'Market value', dataType: 'gold' },
          { key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent' },
          { key: 'avgDailySold', title: 'Daily sold', dataType: 'number' },
          { key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'] }
        ];
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
    SharedService.itemDashboards.length = 0;
    SharedService.sellerDashboards.length = 0;

    SharedService.itemDashboards.push(
      new Dashboard('Most profitable crafts', Dashboard.TYPES.MOST_PROFITABLE_CRAFTS));
    SharedService.itemDashboards.push(
      new Dashboard('Most profitable known crafts', Dashboard.TYPES.MOST_PROFITABLE_KNOWN_CRAFTS));
    SharedService.itemDashboards.push(
      new Dashboard('Items by availability', Dashboard.TYPES.MOST_AVAILABLE_ITEMS));
    if (SharedService.user.apiToUse !== 'none') {
      SharedService.itemDashboards.push(
        new Dashboard('Potential deals', Dashboard.TYPES.POTENTIAL_DEALS));
    }
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
  }

  private setTradeVendorValues(): void {
    this.data.length = 0;
    Object.keys(SharedService.tradeVendorItemMap)
      .forEach(key => {
        this.data.push(SharedService.tradeVendorItemMap[key]);
      });
    this.data.sort((a, b) => b.value - a.value);
  }


  private setCheaperThanVendorSell(): void {
    this.data.length = 0;
    this.data = SharedService.auctionItems.filter(ai =>
      ai.buyout !== 0 && ai.buyout < ai.vendorSell
    ).sort((a, b) =>
      a.buyout / a.vendorSell - b.buyout / b.vendorSell);
  }

  private setCheapBidsWithLowTimeLeft(): void {
    this.data.length = 0;
    this.data = SharedService.auctions.filter(a => {
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
      return match;
    }).sort((a, b) =>
      (b.bid / b.quantity) / SharedService.auctionItemsMap[a.item].buyout -
      (a.bid / a.quantity) / SharedService.auctionItemsMap[a.item].buyout
      );
  }

  private setPotentialDeals(): void {
    this.data.length = 0;
    this.data = SharedService.auctionItems.filter(ai =>
      ai.avgDailySold > 1 && ai.regionSaleRate > 0.30 &&
      ai.buyout / ai.mktPrice < 0.15 && ai.buyout / ai.regionSaleAvg < 0.15)
      .sort((a, b) => a.buyout / a.mktPrice - b.buyout / b.mktPrice);
  }

  private setMostProfitableProfessions(onlyKnown: boolean): void {
    this.data.length = 0;
    this.data = SharedService.recipes
      .sort((a, b) => {
        return b.roi - a.roi;
      })
      .filter(recipe => {
        if (onlyKnown && !SharedService.recipesForUser[recipe.spellID]) {
          return false;
        }
        if (SharedService.user.apiToUse !== 'none') {
          return recipe.avgDailySold > 1 && recipe.regionSaleRate > 0.10;
        }
        return true;
      })
      .slice(0, 100);
  }

  private setSellersGroupedSortedByQuantity(): void {
    this.data.length = 0;
    this.data = this.getListOfOwners()
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 100);
  }

  private setItemsGroupedByAvailablility(): void {
    this.data.length = 0;
    this.data = SharedService.auctionItems.
      sort((a, b) => b.quantityTotal - a.quantityTotal)
      .slice(0, 100);
  }

  private setItemsGroupedBySellerWithHighLiquidity(): void {
    this.data.length = 0;
    this.data = this.getListOfOwners()
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 100);
  }

  private getListOfOwners(): any[] {
    const tmpMap = new Map<string, any>(),
      tmp = [];
    SharedService.auctions.forEach(a => {
      if (!tmpMap[a.owner]) {
        tmpMap[a.owner] = {
          owner: a.owner,
          liquidity: a.buyout,
          volume: a.quantity,
          numOfAuctions: 1,
          auctions: [a]
        };
        tmp.push(tmpMap[a.owner]);
      } else {
        tmpMap[a.owner].liquidity += a.buyout;
        tmpMap[a.owner].volume += a.quantity;
        tmpMap[a.owner].numOfAuctions++;
        tmpMap[a.owner].auctions.push(a);
      }
    });
    return tmp;
  }
}
