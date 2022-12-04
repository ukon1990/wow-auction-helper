import { Component, OnInit, Input } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription} from '@shared/models';
import {Remains} from '@shared/models';
import {ItemService} from '../../../../services/item.service';

@Component({
  selector: 'wah-data-boards',
  templateUrl: './data-boards.component.html',
  styleUrls: ['./data-boards.component.scss']
})
export class DataBoardsComponent implements OnInit {
  @Input() data: Remains[];
  @Input() columns: ColumnDescription[];
  @Input() itemsPerPage = 12;
  @Input() type: string;

  locale = localStorage['locale'].split('-')[0];
  itemToEdit: Remains;
  pageRows: Array<number> = [12, 24, 36];
  pageEvent: PageEvent = { pageIndex: 0, pageSize: this.itemsPerPage, length: 0 };

  constructor() { }

  ngOnInit() {
  }

  setSelectedItem(item: Remains): void {
    SharedService.events.detailSelection.emit(
      ItemService.mapped.value.get(item.id));
  }

  /* istanbul ignore next */
  pageChange(event: PageEvent): void {
    this.pageEvent = event;
  }

    /* istanbul ignore next */
  get toValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[0];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

    /* istanbul ignore next */
  get fromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  openEditWindow(remains: Remains): void {
    this.itemToEdit = remains;
  }

  closeEditWindow(): void {
    this.itemToEdit = undefined;
  }
}