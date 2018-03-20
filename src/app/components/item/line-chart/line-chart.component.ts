import { Component, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
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
export class LineChartComponent implements OnChanges {
  @Input() data: Array<Auction>;
  viewIsInit = false;

  constructor() { }

  ngOnChanges(): void {
    setTimeout(() => {
      const myChart = new Chart('line-chart', {
        type: 'line',
        data: {
          labels: this.data.filter(d => d.buyout > 0).map((d, i) => i + 1),
          datasets: [{
            label: 'Auctions by buyout/item',
            data: this.data
              .sort((a, b) => a.buyout / a.quantity - b.buyout / b.quantity)
              .filter(d => d.buyout > 0).map(d => d.buyout / d.quantity / 10000),
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
    }, 100);
  }

  /* istanbul ignore next */
  getColor(): string {
    return SharedService.user.isDarkMode ? 'white' : 'black';
  }
}
