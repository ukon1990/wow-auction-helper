import { Component, AfterViewInit, Input, Output, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ColumnDescription } from '../../models/column-description';
import { SharedService } from '../../services/shared.service';
import { AuctionItem } from '../../models/auction/auction-item';
import { Auction } from '../../models/auction/auction';
import { Recipe } from '../../models/crafting/recipe';
import { User } from '../../models/user/user';
import * as $WowheadPower from '../../../assets/js/power';
import { SafeResourceUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

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
  auctionDuration = {
    'VERY_LONG': '12h+',
    'LONG': '2-12h',
    'MEDIUM': '30m-2h',
    'SHORT': '<30m'
  };

  constructor() { }

  ngAfterViewInit() {
    this.initWoWhead();
  }

  ngOnChanges(change) {
    if (change && change.data) {
      // this.pageEvent.length = change.data.currentValue.length;
    }
  }

  setSelectedItem(item: any): void {
    if (item.item) {
      SharedService.selectedItemId = item.item;
    } else {
      SharedService.selectedItemId = item.itemID;
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
      return this.pageRows[0];
    }
    return this.pageEvent.pageSize * (this.pageEvent.pageIndex + 1);
  }

  /* istanbul ignore next */
  getUser(): User {
    return SharedService.user;
  }

  /* istanbul ignore next */
  isDarkMode(): boolean {
    return SharedService.user.isDarkMode;
  }

  getIcon(): SafeResourceUrl {
    // background-image: url("https://render-eu.worldofwarcraft.com/icons/56/inv_herbalism_70_dreamleaf.jpg");
    return null;
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
