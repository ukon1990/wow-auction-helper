import {AfterContentInit, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {SummaryCard} from '../../../../models/summary-card.model';
import {AuctionsService} from '../../../../services/auctions.service';
import {Auction} from '../../../auction/models/auction.model';
import {FormControl} from '@angular/forms';
import {NumberUtil} from '../../../util/utils/number.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {ChartData} from '../../../util/models/chart.model';

@Component({
  selector: 'wah-auctions-chart',
  templateUrl: './auctions-chart.component.html',
  styleUrls: ['./auctions-chart.component.scss']
})
export class AuctionsChartComponent implements OnChanges, OnDestroy, AfterContentInit {
  @Input() auctions: Auction[] = [];
  sm = new SubscriptionManager();
  medianPercentLimit: FormControl;
  medianPrice: number;
  localStorageName = 'wah-auctions-chart-median-percent';
  datasets: ChartData;

  constructor(private auctionsService: AuctionsService) {
    const medianPercentLimit = localStorage.getItem(this.localStorageName);
    this.medianPercentLimit = new FormControl(medianPercentLimit ? +medianPercentLimit : 5);
    this.sm.add(this.auctionsService.events.groupedList, (map) => {
      this.setAuctionAndDataset();
    });
    this.sm.add(this.medianPercentLimit.valueChanges,
      medianPercent => this.setAuctionAndDataset(medianPercent));
  }

  ngOnChanges() {
    setTimeout(() =>
      this.ngAfterContentInit());
  }

  ngAfterContentInit() {
    this.setAuctionAndDataset();
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private resetDailyChartData() {
    this.datasets = {
      labels: [],
      axisLabels: {
        yAxis1: 'Price',
        yAxis2: 'Quantity'
      },
      datasets: [{
        label: 'Min price',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Quantity',
        data: [],
        type: 'line',
        yAxisID: 'yAxes-2',
        backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
      }],
      labelCallback: this.tooltipCallback
    };
  }

  private setAuctionAndDataset(medianPercentLimit: number = this.medianPercentLimit.value) {
    localStorage.setItem(this.localStorageName, '' + medianPercentLimit);
    this.resetDailyChartData();

    if (this.auctions && this.auctions.length) {
      const unitPriceMap = {},
        unitPrices = [];
      const middleAuction: Auction = this.auctions[Math.round(this.auctions.length / 2)];
      this.medianPrice = (middleAuction.buyout / middleAuction.quantity) / 10000;
      this.auctions.forEach((a, i) => {
        const value = (a.buyout / a.quantity) / 10000;
        if (value <= this.medianPrice * medianPercentLimit) {
          if (!unitPriceMap[value]) {
            unitPriceMap[value] = {price: value, quantity: a.quantity};
            unitPrices.push(unitPriceMap[value]);
          } else {
            unitPriceMap[value].quantity += a.quantity;
          }
        }
      });
      unitPrices
        .sort((a, b) => b.price - a.price)
        .forEach(({quantity, price}, index) => {
          this.datasets.datasets[0].data.push(price);
          this.datasets.datasets[1].data.push(quantity);
          this.datasets.labels.push('');
        });
    }
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
