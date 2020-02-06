import {AfterViewInit, Component, Input} from '@angular/core';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemPriceEntry} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ErrorReport} from '../../../../utils/error-report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {ChartData} from '../../../util/models/chart.model';
import {NumberUtil} from '../../../util/utils/number.util';
import {Report} from '../../../../utils/report.util';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements AfterViewInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  sm = new SubscriptionManager();
  priceHistory: {hourly: ItemPriceEntry[], daily: any[]} = {
    hourly: [],
    daily: []
  };
  fourteenDayHourByHour: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallbackHourly
  };
  fourteenDayByHourTable = {
    columns: [
      {key: 'timestamp', title: 'Time', dataType: 'date'},
      {key: 'min', title: 'Price', dataType: 'gold'}
    ],
    data: []
  };
  dateData: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallbackDaily
  };
  groupedByDateTable = {
    columns: [
      {key: 'date', title: 'Date', dataType: 'string'},
      {key: 'min', title: 'Lowest min price', dataType: 'gold'},
      {key: 'minQuantity', title: 'Min quantity', dataType: 'number'},
      {key: 'avg', title: 'Avg min price', dataType: 'gold'},
      {key: 'avgQuantity', title: 'Avg quantity', dataType: 'number'},
      {key: 'max', title: 'Highest min price', dataType: 'gold'},
      {key: 'maxQuantity', title: 'Max quantity', dataType: 'number'}
    ],
    data: []
  };
  isLoading = true;

  constructor(private service: ItemService) {
  }

  ngAfterViewInit() {
    Report.debug(
      'ItemPriceHistoryComponent',
      'Item detail view',
      `Price history tab for ${this.auctionItem.itemID} - ${this.auctionItem.name}`);
    this.isLoading = true;
    this.service.getPriceHistory(this.item.id, this.auctionItem.petSpeciesId, this.auctionItem.bonusIds)
      .then((history) => {
        this.priceHistory = history;
        this.setAuctionAndDataset();
        this.isLoading = false;
      })
      .catch((error) => {
        this.setAuctionAndDataset();
        this.isLoading = false;
        this.priceHistory.daily = [];
        this.priceHistory.hourly = [];
        ErrorReport.sendHttpError(error);
      });
  }

  private setAuctionAndDataset() {
    this.resetHourlyChart();
    this.resetDailyChartData();

    if (this.priceHistory && this.priceHistory.hourly.length) {
      this.processHourlyData();
    }
    if (this.priceHistory && this.priceHistory.daily.length) {
      this.processDailyData();
    }
  }

  private processDailyData() {
    this.priceHistory.daily = this.priceHistory.daily.sort((a, b) =>
      a.timestamp - b.timestamp);
    this.priceHistory.daily.forEach((entry) => {
      this.calculateDailyValues(entry);
    });
    this.groupedByDateTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
  }

  private processHourlyData() {
    this.priceHistory.hourly = this.priceHistory.hourly.sort((a, b) =>
      a.timestamp - b.timestamp);
    const dateMap = {},
      dates = [];
    this.priceHistory.hourly.forEach((entry) => {
      const date = new Date(entry.timestamp);
      this.calculateHourlyValues(entry.min / 10000, entry, date);
    });
    this.populateDailyChartData(dates);
    this.fourteenDayByHourTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
  }

  private resetHourlyChart() {
    this.fourteenDayHourByHour.labels.length = 0;
    this.fourteenDayByHourTable.data.length = 0;
    this.fourteenDayHourByHour.datasets = [];
    this.fourteenDayHourByHour.datasets.push({
      label: 'Price',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 255, 22, 0.4)'
    });
    this.fourteenDayHourByHour.datasets.push({
      label: 'Quantity',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
    });
  }

  private populateDailyChartData(dates: any[]) {
    this.groupedByDateTable.data.length = 0;
    dates.forEach(date => {
      this.groupedByDateTable.data.push(date);
      this.dateData.labels.push(date.date);
      this.dateData.datasets[0].data.push(date.min);
      this.dateData.datasets[1].data.push(date.avg);
      this.dateData.datasets[2].data.push(date.max);
      this.dateData.datasets[3].data.push(date.minQuantity);
      this.dateData.datasets[4].data.push(date.avgQuantity);
      this.dateData.datasets[5].data.push(date.maxQuantity);
    });
  }

  private calculateHourlyValues(minGold: number, entry: ItemPriceEntry, date: Date) {
    this.fourteenDayHourByHour.datasets[0].data.push(minGold);
    this.fourteenDayHourByHour.datasets[1].data.push(entry.quantity);
    this.fourteenDayHourByHour.labels.push(date.toLocaleString());
    this.fourteenDayByHourTable.data.push(entry);
  }

  private calculateDailyValues(entry) {
    const date = new Date(entry.timestamp).toLocaleDateString();
    this.dateData.datasets[0].data.push(entry.min / 10000);
    this.dateData.datasets[1].data.push(entry.avg / 10000);
    this.dateData.datasets[2].data.push(entry.max / 10000);
    this.dateData.datasets[3].data.push(entry.minQuantity);
    this.dateData.datasets[4].data.push(entry.avgQuantity);
    this.dateData.datasets[5].data.push(entry.maxQuantity);
    this.dateData.labels.push(date);
    this.groupedByDateTable.data.push({
      ...entry,
      date
    });
  }

  private resetDailyChartData() {
    this.dateData.labels.length = 0;
    this.dateData.datasets = [];
    this.dateData.datasets.push({
      label: 'Min price',
      data: [],
      type: 'line',
      fill: 2,
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 255, 22, 0.4)'
    });
    this.dateData.datasets.push({
      label: 'Avg min price',
      data: [],
      type: 'line',
      fill: 1,
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(255, 144, 0, 0.78)'
    });
    this.dateData.datasets.push({
      label: 'Max min price',
      data: [],
      type: 'line',
      fill: 0,
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 173, 255, 0.61)'
    });
    this.dateData.datasets.push({
      label: 'Min quantity',
      data: [],
      type: 'bar',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(9,100%,50%,0.33)'
    });
    this.dateData.datasets.push({
      label: 'Avg quantity',
      data: [],
      type: 'bar',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
    });
    this.dateData.datasets.push({
      label: 'Max quantity',
      data: [],
      type: 'bar',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(0,100%,17%,0.33)'
    });
  }

  tooltipCallbackDaily(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex > 2) {
      return dataset.label + ': ' +
        NumberUtil.format(dataset.data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(dataset.data[index] * 10000);
  }

  tooltipCallbackHourly(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    if (datasetIndex === 1) {
      return dataset.label + ': ' +
        NumberUtil.format(data.datasets[datasetIndex].data[index]);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(data.datasets[datasetIndex].data[index] * 10000);
  }
}
