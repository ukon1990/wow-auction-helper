import { Component, AfterViewInit, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { Seller } from '../../../models/seller';
import { itemClasses } from '../../../models/item/item-classes';

@Component({
  selector: 'wah-seller-chart',
  templateUrl: './seller-chart.component.html',
  styleUrls: ['./seller-chart.component.scss']
})
export class SellerChartComponent implements AfterViewInit {
  @Input() seller: Seller;
  itemClasses: Array<any>;
  labels: Array<string> = new Array<string>();
  chart: Chart;

  constructor() { }

  ngAfterViewInit() {
   this.setChart(this.itemClasses);
  }

  setChart(data: Array<any>): void {
    this.chart = new Chart('donut-chart', {
      type: 'doughnut',
      data: data
      // options: options
    });
  }

  setData(): void {
    itemClasses.classes.forEach(c => {});
  }
}
