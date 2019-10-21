import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource, Sort} from '@angular/material';
import {ColumnDescription} from '../../models/column-description';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'wah-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {
  @Input() id: any;
  @Input() iconSize: number;
  @Input() isCrafting: boolean;
  @Input() showOwner: boolean;
  @Input() columnDefs: ColumnDescription[];
  @Input() data: any[];
  @Input() footerRowData: any;
  @Input() numOfRows: number;
  @Input() hideCraftingDetails: boolean;
  @Input() useAuctionItemForName: boolean;
  @Input() linkType: string;
  @Input() itemsPerPage = 10;
  @Input() maxVisibleRows: number;
  @Input() disableItemsPerPage: boolean;
  @Input() filterParameter: string;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  locale = (localStorage['locale'] || 'en_GB').split('-')[0];
  dataSource = new MatTableDataSource();
  pageRows: Array<number> = [10, 20, 40, 80, 100];
  columnKeys: string[] = [];

  constructor() {
  }

  /* istanbul ignore next */
  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.itemsPerPage;
   //  {pageIndex: 0, pageSize: this.itemsPerPage, length: 0}
  }

  /* istanbul ignore next */
  ngOnChanges({columnDefs, data}: SimpleChanges): void {
    if (columnDefs && columnDefs.currentValue) {
      this.columnKeys = Object.keys(columnDefs.currentValue);
    }

    if (data && data.currentValue) {
      this.setDataSource(data.currentValue);
    }

  }

  /* istanbul ignore next */
  private setDataSource(data: any[]) {
    this.dataSource.data = [...data];
  }

  /* istanbul ignore next */
  sortRows(sort: Sort) {
    if (sort.direction === '') {
      this.setDataSource(this.data);
      return;
    }
    /*
    this.setDataSource(
      RowSortUtil.sort(
        this.data, this.columnDef[sort.active], sort.direction));
        */
  }
}
