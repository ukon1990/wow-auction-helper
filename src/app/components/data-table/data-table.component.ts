import { Component, AfterViewInit, Input, Output, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ColumnDescription } from '../../models/column-description';
import { SharedService } from '../../services/shared.service';

declare const $WowheadPower;
@Component({
  selector: 'wah-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnChanges {

  @Input() isCrafting: boolean;
  @Input() columns: Array<ColumnDescription>;
  @Input() data: Array<any>;
  pageEvent: PageEvent;
  pageRows: Array<number> = [10, 20, 40, 80, 100];

  constructor() { }

  ngAfterViewInit() {
    this.initWoWhead();
  }

  ngOnChanges(change) {
    if (change && change.data) {
      // this.pageEvent.length = change.data.currentValue.length;
    }
  }

  getFromValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return 0;
    }
    return (this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1)) - this.pageEvent.pageSize;
  }

  pageChange(event: PageEvent): void {
    this.pageEvent = event;
    this.initWoWhead(100);
  }

  getToValue(): number {
    if (!this.pageEvent || !this.pageEvent.pageSize) {
      return this.pageRows[1];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  /* istanbul ignore next */
  private initWoWhead(time?: number): void {
    if ($WowheadPower) {
      setTimeout(() => {
        $WowheadPower.init();
      }, time ? time : 1000);
    }
  }
}
