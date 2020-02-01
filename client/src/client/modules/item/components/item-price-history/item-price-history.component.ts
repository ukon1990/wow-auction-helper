import {AfterViewInit, Component, Input} from '@angular/core';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemPriceEntry} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SummaryCard} from '../../../../models/summary-card.model';
import {ErrorReport} from '../../../../utils/error-report.util';
import {Report} from '../../../../utils/report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {Dataset} from '../../../util/models/dataset.model';
import {ChartData} from '../../../util/models/chart.model';
import {NumberUtil} from '../../../util/utils/number.util';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements AfterViewInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  sm = new SubscriptionManager();
  chartData: SummaryCard = new SummaryCard('', '');
  priceHistory: ItemPriceEntry[] = [];
  fourteenDayHourByHour: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  dateData: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  isLoading = true;

  constructor(private service: ItemService) {
  }

  ngAfterViewInit() {
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
        this.priceHistory = [];
        ErrorReport.sendHttpError(error);
      });
  }

  private setAuctionAndDataset() {
    this.fourteenDayHourByHour.labels.length = 0;
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
    this.resetDailyChartData();

    if (this.priceHistory && this.priceHistory.length) {
      this.priceHistory = this.priceHistory.sort((a, b) =>
        a.timestamp - b.timestamp);
      const dateMap = {},
        dates = [];
      this.priceHistory.forEach((entry) => {
        const date = new Date(entry.timestamp),
          minGold = entry.min / 10000;
        this.calculateDailyValues(date, dateMap, dates, minGold, entry);

        this.calculateHourlyValues(minGold, entry, date);
      });
      this.populateDailyChartData(dates);
      console.log(dates, this.dateData);
    }
    Report.debug('setAuctionAndDataset', {chart: this.chartData, data: this.priceHistory});
  }

  private populateDailyChartData(dates: any[]) {
    dates.forEach(date => {
      this.dateData.labels.push(date.date);
      this.dateData.datasets[0].data.push(date.min);
      this.dateData.datasets[1].data.push(date.avg);
      this.dateData.datasets[2].data.push(date.max);
      this.dateData.datasets[3].data.push(date.avgQuantity);
    });
  }

  private calculateHourlyValues(minGold: number, entry: ItemPriceEntry, date: Date) {
    this.fourteenDayHourByHour.datasets[0].data.push(minGold);
    this.fourteenDayHourByHour.datasets[1].data.push(entry.quantity);
    this.fourteenDayHourByHour.labels.push(date.toLocaleString());
  }

  private calculateDailyValues(date: Date, dateMap: {}, dates: any[], minGold: number, entry: ItemPriceEntry) {
    const id = date.toLocaleDateString();
    if (!dateMap[id]) {
      dateMap[id] = {date: id, min: 0, avg: 0, max: 0, avgQuantity: 0};
      dates.push(dateMap[id]);
    }
    if (!dateMap[id].min || dateMap[id].min > minGold) {
      dateMap[id].min = minGold;
    }

    if (!dateMap[id].max || dateMap[id].max < minGold) {
      dateMap[id].max = minGold;
    }

    if (!dateMap[id].avg) {
      dateMap[id].avg = minGold;
    } else {
      dateMap[id].avg = (minGold + dateMap[id].avg) / 2;
    }

    if (!dateMap[id].avgQuantity) {
      dateMap[id].avgQuantity = entry.quantity;
    } else {
      dateMap[id].avgQuantity = (entry.quantity + dateMap[id].avgQuantity) / 2;
    }
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
      label: 'Quantity',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
    });
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    return 'Price: ' + new GoldPipe().transform(data.datasets[0].data[index] * 10000) +
      ' | Quantity: ' + NumberUtil.format(data.datasets[1].data[index]);
  }
}
