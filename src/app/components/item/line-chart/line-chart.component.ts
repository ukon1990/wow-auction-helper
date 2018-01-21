import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
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
export class LineChartComponent implements AfterViewInit {
  @Input() data: Array<Auction>;
  // @ViewChild('svgElement') svgElement: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  constructor() { }

  /* istanbul ignore next */
  ngAfterViewInit() {

    const myChart = new Chart('line-chart', {
      type: 'line',
      data: {
        labels: this.data.filter(d => d.buyout > 0).map((d, i) => i + 1),
        datasets: [{
          label: 'Auctions by buyout/item',
          data: this.data.filter(d => d.buyout > 0).map(d => d.buyout / d.quantity / 10000),
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

  /* istanbul ignore next */
  getColor(): string {
    return SharedService.user.isDarkMode ? 'white' : 'black';
  }
}
