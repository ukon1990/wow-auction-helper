import { ColumnDescription } from './column-description';
import { SharedService } from '../services/shared.service';

export class Dashboard {

  title: string;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<any> = new Array<any>();

  constructor(title: string, type: string) {
    this.title = title;
  }

  setMostProfitableProfessions(): void {
    this.data.length = 0;
    this.data = SharedService.recipes
      .sort( (a, b) => a.roi - b.roi)
      .slice(0, 30);
  }

  setSellersGroupedSortedByQuantity(): void {
    this.data.length = 0;
  }

  setItemsGroupedByAvailablility(): void {
    this.data.length = 0;
  }
}
