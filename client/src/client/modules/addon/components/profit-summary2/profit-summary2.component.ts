import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-profit-summary2',
  templateUrl: './profit-summary2.component.html',
})
export class ProfitSummary2Component implements OnInit, OnDestroy {
  realms = [];
  form = new FormGroup({
    realm: new FormControl(),
    character: new FormControl(),
    startDate: new FormControl(),
    endDate: new FormControl(),
  });
  columns: ColumnDescription = [];
  private sm = new SubscriptionManager();

  constructor() { }

  ngOnInit(): void {
    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleTsmEvent(data));
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }


  handleTsmEvent(data: TSMCSV): void {
    if (!data) {
      return;
    }
    this.realms.length = 0;

    // this.profitSummary = data.profitSummary;

    Object.keys(data.profitSummary)
      .forEach(realm =>
        this.realms.push(realm));
  }
}
