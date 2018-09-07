import { FormControl } from '@angular/forms';
import { Component, Input, ViewChild, ElementRef, OnChanges, AfterContentInit } from '@angular/core';
import { Chart } from 'chart.js';
import { Auction } from '../../../models/auction/auction';
import { SharedService } from '../../../services/shared.service';

// Replace with : http://www.chartjs.org/samples/latest/
declare let $: Function;
@Component({
  selector: 'wah-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterContentInit {
  @Input() data: Array<Auction>;
  viewIsInit = false;
  hideOutliers: FormControl = new FormControl(true);
  chart: Chart;

  constructor() {
    this.hideOutliers.valueChanges.subscribe(() => {
      setTimeout(this.paintChart(), 100);
    });
  }

  ngAfterContentInit(): void {
    this.paintChart();
  }

  paintChart(): void {
    const firstAuction = new Auction();
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('line-chart', {
      type: 'line',
      data: {
        labels: this.data.filter(d => d.buyout > 0).map((d, i) => i + 1),
        datasets: [{
          label: 'Auctions by buyout/item',
          data: this.data
            .sort((a, b) => a.buyout / a.quantity - b.buyout / b.quantity)
            .filter((a) => a.buyout > 0 && this.filterData(a, firstAuction))
            .map(d => d.buyout / d.quantity / 10000),
          backgroundColor: this.getColor(),
          borderColor: this.getColor(),
          steppedLine: false,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        legend: {
          labels: {
            // This more specific font property overrides the global property
            fontColor: this.getColor()
          }
        }
      }
    });
  }

  filterData(currentAuction:Auction, firstAuction: Auction) {
    if (firstAuction.buyout && this.hideOutliers.value) {
      return this.isNotOutlier(currentAuction, firstAuction);
    } else {
      firstAuction.buyout = currentAuction.buyout;
      firstAuction.quantity = currentAuction.quantity;;
      return true;
    }
  }

  isNotOutlier(a: Auction, b: Auction): boolean {
    return (a.buyout / a.quantity) / (b.buyout / b.quantity) < 20;
  }

  /* istanbul ignore next */
  getColor(): string {
    return SharedService.user.isDarkMode ? 'white' : 'black';
  }
}
