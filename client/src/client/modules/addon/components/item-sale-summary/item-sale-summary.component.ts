import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {ColumnDescription} from '@shared/models';
import {SharedService} from '../../../../services/shared.service';
import {FormControl} from '@angular/forms';
import {SummaryCard} from '../../../../models/summary-card.model';
import {Report} from '../../../../utils/report.util';
import {ErrorReport} from '../../../../utils/error-report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ProfitSummary} from '../../models/profit-summary.model';
import {UserProfit} from '../../models/user-profit.model';
import {NumberUtil} from '@shared/utils';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {ChartData} from '../../../util/models/chart.model';

@Component({
  selector: 'wah-item-sale-summary',
  templateUrl: './item-sale-summary.component.html',
  styleUrls: ['./item-sale-summary.component.scss']
})
export class ItemSaleSummaryComponent implements AfterContentInit, OnDestroy, OnChanges {
  @Input() itemId: number;
  @Input() dialogId: string;
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
  purchaseDatasets: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };

  saleDatasets: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  private axisLabels = {
    yAxis1: 'Price',
    yAxis2: 'Quantity',
    xAxis: 'Time'
  };

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

  private resetDailyChartData() {
    this.saleDatasets = {
      labels: [],
      axisLabels: this.axisLabels,
      datasets: [{
        label: 'Sale price',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Sold quantity',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-2',
        backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
      }],
      labelCallback: this.tooltipCallback
    };

    this.purchaseDatasets = {
      labels: [],
      axisLabels: this.axisLabels,
      datasets: [{
        label: 'Purchase price',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Purchased quantity',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-2',
        backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
      }],
      labelCallback: this.tooltipCallback
    };
  }

  setData(setKey: string): void {
    try {
      if (!this.realm) {
        return;
      }
      const realms = SharedService.tsmAddonData.profitSummary;
      localStorage[this.LOCAL_STORAGE_KEY] = setKey;

      if (realms && realms[this.realm]) {
        const dataset: UserProfit = ((realms[this.realm] as ProfitSummary)[setKey] as UserProfit);
        console.log('dataset', dataset, setKey);
        this.data = [];
        this.resetDailyChartData();
        this.setChartData(dataset);
        this.addDatasetData(dataset);

        Report.debug('setData dataset', dataset, this.chartData, this.data);

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

  private addDatasetData(dataset: UserProfit) {
    const purchases = dataset.purchases.itemMap[this.itemId],
      sales = dataset.sales.itemMap[this.itemId];
    if (purchases) {
      purchases.history.sort((a, b) =>
        a.timestamp - b.timestamp)
        .forEach(({buyout, quantity, timestamp}) => {
          this.purchaseDatasets.labels.push(new Date(timestamp).toLocaleString());
          this.purchaseDatasets.datasets[0].data.push(buyout / 10000);
          this.purchaseDatasets.datasets[1].data.push(quantity);
        });
    }

    if (sales) {
      sales.history.sort((a, b) =>
        a.timestamp - b.timestamp)
        .forEach(({buyout, quantity, timestamp}) => {
          this.saleDatasets.labels.push(new Date(timestamp).toLocaleString());
          this.saleDatasets.datasets[0].data.push(buyout / 10000);
          this.saleDatasets.datasets[1].data.push(quantity);
        });
    }

    console.log('addDatasetData', {
      sale: this.saleDatasets,
      purchase: this.purchaseDatasets
    });
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex === 1) {
      return dataset.label + ': ' +
        NumberUtil.format(dataset.data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(dataset.data[index] * 10000);
  }
}