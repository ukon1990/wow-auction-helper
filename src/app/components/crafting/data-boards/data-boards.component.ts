import { Component, OnInit, Input } from '@angular/core';
import { ColumnDescription } from '../../../models/column-description';
import { SharedService } from '../../../services/shared.service';
import { Remains } from '../../../models/item/remains.model';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'wah-data-boards',
  templateUrl: './data-boards.component.html',
  styleUrls: ['./data-boards.component.scss']
})
export class DataBoardsComponent implements OnInit {
  @Input() data: Remains[];
  @Input() columns: ColumnDescription[];
  @Input() itemsPerPage = 10;


  pageRows: Array<number> = [10, 20, 40, 80, 100];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.itemsPerPage, length: 0 };

  constructor() { }

  ngOnInit() {
  }

  setSelectedItem(item: Remains): void {
    SharedService.selectedItemId = item.id;
    SharedService.selectedSeller = undefined;
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }
}
