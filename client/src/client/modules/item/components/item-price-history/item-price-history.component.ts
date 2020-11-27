import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemPriceEntry} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ErrorReport} from '../../../../utils/error-report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {NumberUtil} from '../../../util/utils/number.util';
import {Report} from '../../../../utils/report.util';
import {Chart, SeriesOptionsType, XAxisOptions} from 'highcharts';
import {AuctionStatsUtil} from '../../../../../../../api/src/auction/utils/auction-stats.util';
import {ItemStats} from '../../../../../../../api/src/auction/models/item-stats.model';
import {ThemeUtil} from '../../../core/utils/theme.util';
import {Theme} from '../../../core/models/theme.model';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements OnChanges, AfterViewInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  @Input() isActiveTab = true;
  @Input() dialogId: string;
  stats: ItemStats;
  Highcharts: typeof Highcharts = Highcharts;
  sm = new SubscriptionManager();
  hourlyChart: SeriesOptionsType[] = [
    {
      name: 'Quantity',
      data: [],
      type: 'line',
      yAxis: 1,
      color: 'hsla(0, 100%, 50%, 0.7)',
    }, {
      name: 'Prices',
      data: [],
      color: 'rgba(0, 255, 22, 0.7)',
      type: 'line',
    }
  ];
  dailyChart: SeriesOptionsType[] = [
    {
      name: 'Price range',
      data: [],
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: 'rgba(0, 255, 22, 0.7)',
      fillOpacity: 0.3,
      zIndex: 0,
      marker: {
        enabled: false
      }
    }, {
      name: 'Avg price',
      data: [],
      type: 'line',
      zIndex: 1,
      color: 'rgba(255, 144, 0, 0.8)',
      marker: {
        fillColor: 'white',
        lineWidth: 2,
        lineColor: 'rgba(255, 144, 0, 0.8)'
      }
    }, {
      name: 'Quantity range',
      data: [],
      type: 'arearange',
      lineWidth: 0,
      linkedTo: ':previous',
      color: 'hsla(0, 100%, 50%, 0.7)',
      fillOpacity: 0.3,
      zIndex: 0,
      yAxis: 1,
      marker: {
        enabled: false
      }
    }, {
      name: 'Quantity avg',
      data: [],
      type: 'line',
      zIndex: 1,
      yAxis: 1,
      color: 'rgba(255, 144, 0, 0.8)',
      marker: {
        fillColor: 'red',
        lineWidth: 2,
        lineColor: 'hsla(0,100%,50%,0.7)'
      }
    }
  ];
  xAxis: XAxisOptions;
  priceHistory: { hourly: ItemPriceEntry[], daily: any[] } = {
    hourly: [],
    daily: []
  };
  fourteenDayByHourTable = {
    columns: [
      {key: 'timestamp', title: 'Time', dataType: 'date'},
      {key: 'min', title: 'Price', dataType: 'gold'}
    ],
    data: []
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
  updateDailyChart: any;
  isInitiated: boolean;
  theme: Theme = ThemeUtil.current;

  constructor(private service: ItemService) {
  }

  ngOnChanges({item, auctionItem, isActiveTab}: SimpleChanges) {
    if (this.isInitiated && auctionItem && auctionItem.currentValue) {
      this.loadData(auctionItem.currentValue);
    }

    if (this.isInitiated && !this.isLoading && isActiveTab && isActiveTab.currentValue) {
      this.isInitiated = false;
      this.ngAfterViewInit();
    }
  }

  ngAfterViewInit() {
    this.loadData();
    setTimeout(() =>
        this.isInitiated = true,
      500);
  }

  private loadData(auctionItem: AuctionItem = this.auctionItem) {
    Report.debug(
      'ItemPriceHistoryComponent',
      'Item detail view',
      `Price history tab for ${auctionItem.itemID} - ${auctionItem.name}`);
    this.isLoading = true;
    this.service.getPriceHistory(this.item.id, auctionItem.petSpeciesId, auctionItem.bonusIds)
      .then((history) => {
        this.priceHistory = history;
        this.setAuctionAndDataset();
        this.stats = AuctionStatsUtil.processDaysForHourlyPriceData(history.hourly);
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
    if (this.priceHistory) {
      if (this.priceHistory.hourly && this.priceHistory.hourly.length) {
        this.resetSeriesData(this.hourlyChart);
        this.processHourlyData();
      }
      if (this.priceHistory.daily && this.priceHistory.daily.length) {
        this.resetSeriesData(this.dailyChart);
        this.processDailyData();
      }
      this.updateDailyChart = Math.random();
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
    const format = '%e. %b %y';
    this.xAxis = {
      type: 'datetime',
      labels: {
        format: '{value}',
        formatter: ({value}) => Highcharts.dateFormat(format, +value),
      },
      title: {
        text: null
      }
    };
  }

  private processHourlyData() {
    this.priceHistory.hourly = this.priceHistory.hourly.sort((a, b) =>
      a.timestamp - b.timestamp);
    const dates = [];
    this.priceHistory.hourly.forEach((entry) => {
      const date = new Date(entry.timestamp);
      this.calculateHourlyValues(entry.min, entry, date);
    });
    this.populateDailyChartData(dates);
    this.fourteenDayByHourTable.data.sort((a, b) =>
      b.timestamp - a.timestamp);
  }

  private populateDailyChartData(dates: any[]) {
    this.groupedByDateTable.data.length = 0;
    this.dailyChart.forEach(series => series['data'].length = 0);

    dates.forEach(date => this.calculateDailyValues(date));
  }


  private calculateHourlyValues(minGold: number, entry: ItemPriceEntry, date: Date) {
    this.fourteenDayByHourTable.data.push(entry);
    this.hourlyChart[0]['data'].push([+date, entry.quantity]);
    this.hourlyChart[1]['data'].push([+date, minGold]);
  }

  private calculateDailyValues(entry) {
    this.groupedByDateTable.data.push(entry);

    const date = new Date(entry).toLocaleDateString();
    this.dailyChart[0]['data'].push([entry.timestamp, entry.min, entry.max]);
    this.dailyChart[1]['data'].push([entry.timestamp, entry.avg]);
    this.dailyChart[2]['data'].push([entry.timestamp, entry.minQuantity, entry.maxQuantity]);
    this.dailyChart[3]['data'].push([entry.timestamp, entry.avgQuantity]);
  }

  private resetSeriesData(series: SeriesOptionsType[]): void {
    series.forEach(s => {
      s['data'] = [];
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

  setChartInstance(chart: Chart) {
    /* I leave this be for now, in case I want to add this back later.

    const start = +new Date(+new Date() - 1000 * 60 * 60 * 24 * 90);
    const end = +new Date();
    chart.xAxis[0].setExtremes(start, end, true);
    chart.showResetZoom();
    */
  }
}
