import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ColumnDescription} from '../../../table/models/column-description';
import {SharedService} from '../../../../services/shared.service';
import {ItemSaleHistory, ItemSaleHistorySummary, ProfitSummaryUtil} from '../../utils/profit-summary.util';
import {Theme} from '../../../core/models/theme.model';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {SeriesOptionsType} from 'highcharts';
import {Report} from '../../../../utils/report.util';

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
  selector: 'wah-profit-summary',
  templateUrl: './profit-summary.component.html',
})
export class ProfitSummaryComponent implements OnInit, OnDestroy {
  realms = [];
  private readonly previousPeriodKey = 'profit_summary_display_period';
  private readonly previousPeriod: string | undefined = localStorage.getItem(this.previousPeriodKey);
  periodInput: FormControl = new FormControl(
    this.previousPeriod ? +this.previousPeriod : 30);
  form = new FormGroup({
    realm: new FormControl(),
    character: new FormControl(),
    startDate: new FormControl(new Date(this.getDateAtPeriodStart(this.periodInput.value))),
    period: new FormControl(30),
    endDate: new FormControl(new Date()),
  });
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name', options: {idName: 'itemId'}},

    {key: 'avgSalePrice', title: 'Avg sale price', dataType: 'gold'},
    {key: 'sumSalePrice', title: 'Sum sale price', dataType: 'gold'},
    {key: 'soldQuantity', title: '# sold', dataType: 'number'},

    {key: 'saleRate', title: 'Sale rate', dataType: 'percent'},
    {key: 'diff', title: 'Diff', dataType: 'gold', options: {tooltip: 'Avg sale price - avg buy price'}},

    {key: 'avgBuyPrice', title: 'Avg purchase price', dataType: 'gold'},
    {key: 'sumBuyPrice', title: 'Sum purchase price', dataType: 'gold'},
    {key: 'boughtQuantity', title: '# Purchased', dataType: 'number'},
  ];
  tableData: TableData;
  private sm = new SubscriptionManager();
  mappedData: ItemSaleHistory[] = [];
  data: ItemSaleHistorySummary;
  theme: Theme = ThemeUtil.current;
  selectedRowData: ItemSaleHistory;
  selectedSeries: SeriesOptionsType[] = [];
  goldLog: SeriesOptionsType[] = [];
  goldLogUpdate = false;
  selectedRowSeriesUpdate = false;

  constructor() {
  }

  ngOnInit(): void {
    this.initContent();

    this.sm.add(
      TsmLuaUtil.events,
      (data: TSMCSV) =>
        this.handleTsmEvent(data));
    this.sm.add(this.form.valueChanges, change => this.calculateData(change));
    this.sm.add(this.periodInput.valueChanges, period => {
      localStorage.setItem(this.previousPeriodKey, period);
      if (period !== null) {
        const startDate = this.getDateAtPeriodStart(period);
        this.form.setValue({
          ...this.form.value,
          startDate: new Date(startDate),
          endDate: new Date(),
        });
      }
    });

  }

  private calculateData({
                          realm,
                          character,
                          startDate,
                          endDate
                        } = this.form.getRawValue()) {
    this.data = new ProfitSummaryUtil().calculate(
      TsmLuaUtil.events.value, realm, startDate, endDate);
    this.mappedData = this.data.list;
    this.goldLog = [{
      name: 'Gold log',
      type: 'line',
      color: this.theme.primaryColorCode,
      data: this.data.goldLog,
    }];
    Report.debug('calculateData', this.data);
    this.goldLogUpdate = !this.goldLogUpdate;
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
    this.calculateData();
  }

  private getDateAtPeriodStart(period: number): number {
    return period === 0 ? +new Date('2010-01-01') : +new Date() - 1000 * 60 * 60 * 24 * period;
  }

  handleRowClick({row}: RowClickEvent<ItemSaleHistory>) {
    this.selectedSeries = [
      {
        name: '# Sold',
        data: row.history.map(entry => [entry.time, entry.saleQuantity]),
        type: 'line',
        yAxis: 1,
        color: this.theme.warnColorCode,
      },
      {
        name: 'Sum sale price',
        data: row.history.map(entry => [entry.time, entry.salePrice]),
        type: 'line',
        color: this.theme.primaryColorCode,
      },
      {
        name: 'Avg sale price',
        data: row.history.map(entry => [entry.time, entry.salePrice / entry.saleQuantity]),
        type: 'line',
        color: this.theme.accentColorCode,
      },
      {
        name: '# Purchased',
        data: row.history.map(entry => [entry.time, entry.buyQuantity]),
        type: 'line',
        dashStyle: 'Dash',
        yAxis: 1,
        color: this.theme.warnColorCode,
      },
      {
        name: 'Sum purchase price',
        data: row.history.map(entry => [entry.time, entry.buyPrice]),
        type: 'line',
        color: this.theme.primaryColorCode,
        dashStyle: 'DashDot'
      },
      {
        name: 'Avg purchase price',
        data: row.history.map(entry => [entry.time, entry.buyPrice / entry.buyQuantity]),
        type: 'line',
        color: this.theme.accentColorCode,
        dashStyle: 'Dash'
      },
    ];
    this.selectedRowData = row;
    this.selectedRowSeriesUpdate = !this.selectedRowSeriesUpdate;
  }

  clearSelection() {
    this.selectedRowData = undefined;
  }
}
