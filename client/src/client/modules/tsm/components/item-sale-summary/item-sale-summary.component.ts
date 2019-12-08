import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {ProfitSummary, UserProfit} from '../../../../utils/tsm/tsm-lua.util';
import {ColumnDescription} from '../../../table/models/column-description';
import {SharedService} from '../../../../services/shared.service';
import {FormControl} from '@angular/forms';
import {SummaryCard} from '../../../../models/summary-card.model';
import {Report} from '../../../../utils/report.util';
import {ChartData} from '../../../../models/chart-data.model';
import {ErrorReport} from '../../../../utils/error-report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';

@Component({
  selector: 'wah-item-sale-summary',
  templateUrl: './item-sale-summary.component.html',
  styleUrls: ['./item-sale-summary.component.scss']
})
export class ItemSaleSummaryComponent implements AfterContentInit, OnDestroy, OnChanges {
  @Input() itemId: number;
  @Output() saleRate: EventEmitter<number> = new EventEmitter<number>();
  readonly LOCAL_STORAGE_KEY = 'item-details-prefered-sale-rate';
  realm: string;
  columns: ColumnDescription[] = [
    {key: 'category', title: 'Category', dataType: 'string'},
    {key: 'quantity', title: 'Quantity', dataType: 'number'},
    {key: 'minPrice', title: 'Min buyout', dataType: 'gold'},
    {key: 'maxPrice', title: 'Max buyout', dataType: 'gold'},
    {key: 'avgPrice', title: 'Avg buyout', dataType: 'gold'},
    {key: 'totalPrice', title: 'Sum', dataType: 'gold'}
  ];
  data = [];
  dataSets = [
    {key: 'past24Hours', title: 'Past 24 hours'},
    {key: 'past7Days', title: 'Past 7 days'},
    {key: 'past14Days', title: 'Past 14 days'},
    {key: 'past30Days', title: 'Past 30 days'},
    {key: 'past90Days', title: 'Past 90 days'},
    {key: 'total', title: 'All'}
  ];
  field = new FormControl(this.getFormFieldValueFromStorage());
  subscriptions = new SubscriptionManager();
  allData = SharedService.tsmAddonData;
  chartData: {
    sales: SummaryCard; purchases: SummaryCard;
  } = {sales: undefined, purchases: undefined};
  personalSaleRate = 0;

  constructor() {
    this.subscriptions.add(
      this.field.valueChanges,
      (setKey) =>
        this.setData(setKey));
  }

  ngOnChanges() {
    setTimeout(() =>
      this.ngAfterContentInit());
  }

  getFormFieldValueFromStorage(): string {
    return localStorage[this.LOCAL_STORAGE_KEY] ?
      localStorage[this.LOCAL_STORAGE_KEY] : 'past90Days';
  }

  ngAfterContentInit() {
    this.realm = SharedService.realms[SharedService.user.realm].name;
    this.setData(this.field.value);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setData(setKey: string): void {
    try {
      if (!this.realm) {
        return;
      }
      const realms = SharedService.tsmAddonData['profitSummary'];
      localStorage[this.LOCAL_STORAGE_KEY] = setKey;

      if (realms && realms[this.realm]) {
        const dataset: UserProfit = ((realms[this.realm] as ProfitSummary)[setKey] as UserProfit);
        this.data.length = 0;
        this.setChartData(dataset);

        this.addChartData(dataset, 'sales');

        this.addChartData(dataset, 'purchases');


        Report.debug('setData dataset', dataset, this.chartData);

        this.saleRate.emit(this.personalSaleRate);
      }
    } catch (error) {
      ErrorReport.sendError('ItemSaleSummaryComponent.setData', error);
    }
  }

  private setChartData(dataset: UserProfit) {
    const sales = dataset.sales.itemMap[this.itemId],
      purchases = dataset.purchases.itemMap[this.itemId],
      expired = dataset.expired.itemMap[this.itemId],
      cancelled = dataset.cancelled.itemMap[this.itemId];

    if (sales) {
      this.data.push(sales);
    }
    if (purchases) {
      this.data.push(purchases);
    }

    if (expired) {
      this.data.push(expired);
    }

    if (cancelled) {
      this.data.push(cancelled);
    }
  }

  private addChartData(dataset: UserProfit, type: string) {
    const item = dataset[type].itemMap[this.itemId];
    this.chartData[type] = new SummaryCard('', 'line');
    if (!item) {
      return;
    }

    item.history
      .forEach(h =>
        this.chartData[type].addEntry(h.timestamp, h.buyout / 10000));
    this.chartData[type].data.sort((a: ChartData, b: ChartData) =>
      a.id - b.id);

    this.chartData[type].data.forEach((data, i) =>
      this.chartData[type].labels.push(
        new ChartData(data.id, new Date(data.id).toLocaleString())));
  }
}
