import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemPriceEntry} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ErrorReport} from '../../../../utils/error-report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {ChartData} from '../../../util/models/chart.model';
import {NumberUtil} from '../../../util/utils/number.util';
import {Report} from '../../../../utils/report.util';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements OnChanges {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  @Input() dialogId: string;
  sm = new SubscriptionManager();
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Hourly prices and quantity for the past 14 days'
    },
    chart: {
      zoomType: 'x',
    },
    xAxis: [{
      categories: [],
      crosshair: true
    }],
    yAxis: [
      { // Primary yAxis
        labels: {
          format: '{value}g',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: 'Gold',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      }, { // Secondary yAxis
        title: {
          text: 'Quantity',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        labels: {
          format: '{value} qty',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        opposite: true
      }
    ],
    tooltip: {
      shared: true
    },
    legend: {
      layout: 'vertical',
      align: 'left',
      x: 120,
      verticalAlign: 'top',
      y: 100,
      floating: true,
      backgroundColor:
        Highcharts.defaultOptions.legend.backgroundColor || // theme
        'rgba(255,255,255,0.25)'
    },
    series: [{
      name: 'Quantity',
      data: [],
      type: 'column',
      yAxis: 1,
    }, {
      name: 'Prices',
      data: [],
      type: 'spline',
    }]
  };
  priceHistory: { hourly: ItemPriceEntry[], daily: any[] } = {
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
  private axisLabels = {
    yAxis1: 'Price',
    yAxis2: 'Quantity',
    xAxis: 'Date'
  };
  updateDailyChart: any;

  constructor(private service: ItemService) {
  }

  ngOnChanges({item, auctionItem}: SimpleChanges) {
    if (auctionItem && auctionItem.currentValue) {
      const ai = auctionItem.currentValue;
      this.resetDailyChartData();
      this.resetHourlyChart();

      Report.debug(
        'ItemPriceHistoryComponent',
        'Item detail view',
        `Price history tab for ${ai.itemID} - ${ai.name}`);
      this.isLoading = true;
      this.service.getPriceHistory(this.item.id, ai.petSpeciesId, ai.bonusIds)
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
  }

  private setAuctionAndDataset() {
    this.resetHourlyChart();
    this.resetDailyChartData();
    if (this.priceHistory) {
      if (this.priceHistory.hourly && this.priceHistory.hourly.length) {
        this.processHourlyData();
      }
      if (this.priceHistory.daily && this.priceHistory.daily.length) {
        this.processDailyData();
      }
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
    this.updateDailyChart = Math.random();
    console.log('Chart shit', this.chartOptions);
  }

  private resetHourlyChart() {
    this.fourteenDayHourByHour.labels.length = 0;
    this.fourteenDayByHourTable.data.length = 0;
    this.fourteenDayHourByHour.datasets = [];
    this.fourteenDayHourByHour.axisLabels = this.axisLabels;
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

    this.chartOptions.xAxis[0]['categories'].push(date.toLocaleString());
    this.chartOptions.series[0]['data'].push(entry.quantity);
    this.chartOptions.series[1]['data'].push(minGold);
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
    this.dateData.axisLabels = this.axisLabels;
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
