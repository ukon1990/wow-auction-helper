import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ColumnDescription} from '../../../table/models/column-description';
import {SharedService} from '../../../../services/shared.service';
import {ProfitSummaryUtil} from '../../utils/profit-summary.util';

interface TableEntry {
  id: number;
  petSpeciesId: number;
  bonusIds: number[];
  uniqueId: string;
  name: string;
  soldValue: number;
  soldQuantity: number;
  buyValue: number;
  buyQuantity: number;
}

interface TableData {
  [key: string]: TableEntry[];
}

@Component({
  selector: 'wah-profit-summary2',
  templateUrl: './profit-summary2.component.html',
})
export class ProfitSummary2Component implements OnInit, OnDestroy {
  realms = [];
  form = new FormGroup({
    realm: new FormControl(),
    character: new FormControl(),
    startDate: new FormControl(new Date(+new Date() - 1000 * 60 * 60 * 24 * 30)),
    endDate: new FormControl(new Date()),
  });
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
  ];
  tableData: TableData;
  private sm = new SubscriptionManager();

  constructor() {
  }

  ngOnInit(): void {
    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleTsmEvent(data));
    this.sm.add(this.form.valueChanges, ({
      realm,
      character,
      startDate,
      endDate
                                         }) => {

      new ProfitSummaryUtil().calculate(TsmLuaUtil.events.value, realm, startDate, endDate);
    });

    this.initContent();
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  initContent(): void {
    const realm = SharedService.realms[SharedService.user.realm];
    if (realm) {
      this.form.controls.realm.setValue(realm.name);
    } else {
      this.sm.add(
        SharedService.events.realms,
        () => this.initContent(),
        {terminateUponEvent: true});
    }
  }

  handleTsmEvent(data: TSMCSV): void {
    if (!data) {
      return;
    }
    this.realms.length = 0;

    Object.keys(data.profitSummary)
      .forEach(realm => {
        this.realms.push(realm);
      });
  }
}
