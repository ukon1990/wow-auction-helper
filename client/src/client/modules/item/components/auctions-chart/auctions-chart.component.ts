import {AfterContentInit, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SummaryCard} from '../../../../models/summary-card.model';
import {ChartData} from '../../../../models/chart-data.model';
import {AuctionsService} from '../../../../services/auctions.service';
import {Auction} from '../../../auction/models/auction.model';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'wah-auctions-chart',
  templateUrl: './auctions-chart.component.html',
  styleUrls: ['./auctions-chart.component.scss']
})
export class AuctionsChartComponent implements OnChanges, OnDestroy, AfterContentInit {
  @Input() auctions: Auction[] = [];
  sm = new SubscriptionManager();
  chartData: SummaryCard = new SummaryCard('', '');
  medianPercentLimit: FormControl;
  medianPrice: number;
  localStorageName = 'wah-auctions-chart-median-percent';

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

  private setAuctionAndDataset(medianPercentLimit: number = this.medianPercentLimit.value) {
    localStorage.setItem(this.localStorageName, '' + medianPercentLimit);
    this.chartData.labels.length = 0;
    this.chartData.clearEntries();

    this.auctions.sort((a, b) =>
      a.buyout / a.quantity - b.buyout / b.quantity);
    const middleAuction: Auction = this.auctions[Math.round(this.auctions.length / 2)];
    this.medianPrice = (middleAuction.buyout / middleAuction.quantity) / 10000;
    this.auctions.forEach((a, i) => {
      const value = (a.buyout / a.quantity) / 10000;
      if (value <= this.medianPrice * medianPercentLimit) {
        this.chartData.addEntry(i, value);
        this.chartData.labels.push(new ChartData(i, a.quantity));
      }
    });
  }
}
