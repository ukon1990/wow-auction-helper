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
  @Input() dialogId: string;

  sm = new SubscriptionManager();
  medianPercentLimit: FormControl;
  medianPrice: number;
  localStorageName = 'wah-auctions-chart-median-percent';
  datasets: ChartData;

  constructor(private auctionsService: AuctionsService) {
    const medianPercentLimit = localStorage.getItem(this.localStorageName);
    this.medianPercentLimit = new FormControl(medianPercentLimit ? +medianPercentLimit : 5);
    this.sm.add(this.auctionsService.mapped, () => {
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

  private setCurrentPriceVariations(labels: string[], prices: number[], quantities: number[]) {
    this.datasets = {
      labels,
      axisLabels: {
        yAxis1: 'Price',
        yAxis2: 'Quantity'
      },
      datasets: [{
        label: 'Min price',
        data: prices,
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Quantity',
        data: quantities,
        type: 'line',
        yAxisID: 'yAxes-2',
        backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
      }],
      labelCallback: this.tooltipCallback
    };
  }

  private setAuctionAndDataset(medianPercentLimit: number = this.medianPercentLimit.value) {
    localStorage.setItem(this.localStorageName, '' + medianPercentLimit);
    const quantities: number[] = [];
    const prices: number[] = [];
    const labels: string[] = [];

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
          prices.push(price);
          quantities.push(quantity);
          labels.push('');
        });
    }
    this.setCurrentPriceVariations(labels, prices, quantities);
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
