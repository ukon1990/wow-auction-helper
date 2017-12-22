import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';

export class Dashboard {
  public static readonly TYPES = {
    TOP_SELLERS_BY_VOLUME: 'TOP_SELLERS_BY_VOLUME',
    TOP_SELLERS_BY_LIQUIDITY: 'TOP_SELLERS_BY_LIQUIDITY',
    MOST_AVAILABLE_ITEMS: 'MOST_AVAILABLE_ITEMS',
    MOST_PROFITABLE_CRAFTS: 'MOST_PROFITABLE_CRAFTS'
  };

  title: string;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<any> = new Array<any>();

  constructor(title: string, type: string) {
    this.title = title;

    switch (type) {
      case Dashboard.TYPES.TOP_SELLERS_BY_LIQUIDITY:
        this.setItemsGroupedBySellerWithHighLiquidity();
        break;
      case Dashboard.TYPES.MOST_AVAILABLE_ITEMS:
        this.setItemsGroupedByAvailablility();
        break;
      case Dashboard.TYPES.MOST_PROFITABLE_CRAFTS:
        this.setMostProfitableProfessions();
        break;
    }
  }

  private setMostProfitableProfessions(): void {
    this.data.length = 0;
    this.data = SharedService.recipes
      .sort( (a, b) => {
        if (a && b) {
          return a.roi - b.roi;
        } else {
          return -1;
        }
      })
      .slice(0, 30);
  }

  private setSellersGroupedSortedByQuantity(): void {
    this.data.length = 0;
  }

  private setItemsGroupedByAvailablility(): void {
    this.data.length = 0;
  }

  private setItemsGroupedBySellerWithHighLiquidity(): void {
    this.data.length = 0;
  }
}
