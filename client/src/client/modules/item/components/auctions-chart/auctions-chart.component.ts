import {AfterContentInit, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {Auction} from '@shared/models';
import {FormControl} from '@angular/forms';
import {SeriesOptionsType, XAxisOptions} from 'highcharts';
import {ThemeUtil} from '../../../core/utils/theme.util';

@Component({
  selector: 'wah-auctions-chart',
  templateUrl: './auctions-chart.component.html',
  styleUrls: ['./auctions-chart.component.scss']
})
export class AuctionsChartComponent implements OnChanges, OnDestroy, AfterContentInit {
  @Input() auctions: Auction[] = [];
  @Input() dialogId: string;

  private theme = ThemeUtil.current;
  sm = new SubscriptionManager();
  medianPercentLimit: FormControl;
  medianPrice: number;
  localStorageName = 'wah-auctions-chart-median-percent';
  xAxis: XAxisOptions[] = [
    {
      type: 'linear',
      visible: false,
    }
  ];

  series: SeriesOptionsType[] = [
    {
      name: 'Quantity',
      data: [],
      type: 'line',
      yAxis: 1,
      color: this.theme.warnColorCode,
    }, {
      name: 'Prices',
      data: [],
      color: this.theme.primaryColorCode,
      type: 'line',
    }
  ];
  chartUpdated: boolean;
  isInitiated: boolean;

  constructor(private auctionsService: AuctionsService) {
    this.sm.add(this.auctionsService.mapped, () => {
      this.setAuctionAndDataset();
    });
  }

  ngOnChanges() {
    setTimeout(() =>
      this.ngAfterContentInit());
  }

  ngAfterContentInit() {
    this.setAuctionAndDataset();
    setTimeout(() =>
        this.isInitiated = true,
      500);
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private setAuctionAndDataset() {
    const quantities: number[][] = [];
    const prices: number[][] = [];

    if (this.auctions && this.auctions.length) {
      const unitPriceMap = {},
        unitPrices = [];
      const middleAuction: Auction = this.auctions[Math.round(this.auctions.length / 2)];
      this.medianPrice = (middleAuction.buyout / middleAuction.quantity);
      this.auctions.forEach((a, i) => {
        const value = (a.buyout / a.quantity);
        if (!unitPriceMap[value]) {
          unitPriceMap[value] = {price: value, quantity: a.quantity};
          unitPrices.push(unitPriceMap[value]);
        } else {
          unitPriceMap[value].quantity += a.quantity;
        }
      });
      unitPrices
        .sort((a, b) => b.price - a.price)
        .forEach(({quantity, price}, index) => {
          prices.push([index, price]);
          quantities.push([index, quantity]);
        });
    }

    this.series[0]['data'] = quantities;
    this.series[1]['data'] = prices;
    this.chartUpdated = true;
  }
}