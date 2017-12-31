import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';

export class Dashboard {
  public static readonly TYPES = {
    TOP_SELLERS_BY_VOLUME: 'TOP_SELLERS_BY_VOLUME',
    TOP_SELLERS_BY_LIQUIDITY: 'TOP_SELLERS_BY_LIQUIDITY',
    MOST_AVAILABLE_ITEMS: 'MOST_AVAILABLE_ITEMS',
    MOST_PROFITABLE_CRAFTS: 'MOST_PROFITABLE_CRAFTS'
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
          { key: 'buyout', title: 'Buyout', dataType: 'gold' }
        ];
        this.setItemsGroupedByAvailablility();
        break;
      case Dashboard.TYPES.MOST_PROFITABLE_CRAFTS:
        this.idParam = 'itemID';
        this.columns = [
          { key: 'name', title: 'Name', dataType: 'name' },
          { key: 'buyout', title: 'Buyout', dataType: 'gold' },
          { key: 'roi', title: 'ROI', dataType: 'gold' }
        ];
        this.setMostProfitableProfessions();
        break;
    }
  }

  public static addDashboards(): void {
    SharedService.dashboards.push(
      new Dashboard('Top sellers by liquidity', Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY));
    SharedService.dashboards.push(
      new Dashboard('Top sellers by volume', Dashboard.TYPES.TOP_SELLERS_BY_VOLUME));
    SharedService.dashboards.push(
      new Dashboard('Most profitable crafts', Dashboard.TYPES.MOST_PROFITABLE_CRAFTS));
    SharedService.dashboards.push(
      new Dashboard('Items by availability', Dashboard.TYPES.MOST_AVAILABLE_ITEMS));
  }

  private setMostProfitableProfessions(): void {
    this.data.length = 0;
    this.data = SharedService.recipes
      .sort((a, b) => {
        return b.roi - a.roi;
      })
      .filter(recipe => {
        if (SharedService.user.apiToUse !== 'none') {
          return recipe.avgDailySold > 1 && recipe.regionSaleRate > 0.10;
        }
        return true;
      })
      .slice(0, 30);
  }

  private setSellersGroupedSortedByQuantity(): void {
    this.data.length = 0;
    this.data = this.getListOfOwners()
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 30);
  }

  private setItemsGroupedByAvailablility(): void {
    this.data.length = 0;
    this.data = SharedService.auctionItems.
      sort((a, b) => b.quantityTotal - a.quantityTotal)
      .slice(0, 30);
  }

  private setItemsGroupedBySellerWithHighLiquidity(): void {
    this.data.length = 0;
    this.data = this.getListOfOwners()
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 30);
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
