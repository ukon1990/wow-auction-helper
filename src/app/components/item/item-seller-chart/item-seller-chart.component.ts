import { Component, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import * as distinctColors from 'distinct-colors';
import { Auction } from '../../../models/auction/auction';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'wah-item-seller-chart',
  templateUrl: './item-seller-chart.component.html',
  styleUrls: ['./item-seller-chart.component.scss']
})
export class ItemSellerChartComponent implements OnChanges, AfterViewInit {
  @Input() auctions: Array<Auction>;
  itemSellers: Array<ItemSeller>;
  itemSellersMap: Map<number, ItemSeller>;
  labels: Array<string> = new Array<string>();
  chart: Chart;
  chartTypeForm: FormControl = new FormControl();
  storageName = 'item-seller-chart';
  colors;

  constructor() {
    this.chartTypeForm.setValue(
      localStorage[this.storageName] ? localStorage[this.storageName] : 'pie');
    this.chartTypeForm.valueChanges.subscribe(type => {
      setTimeout(() => {
        this.save();
        this.setChart(this.itemSellers);
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    this.setData();
    this.setChart(this.itemSellers);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      this.colors = distinctColors({ count: this.itemSellers.length });
      this.setData();
      this.setChart(this.itemSellers);
    }, 100);
  }

  setChart(data: Array<any>): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('chart', {
      type: this.chartTypeForm.value,
      data: {
        datasets: [{
          data: this.itemSellers.map(c => c.quantity),
          backgroundColor: this.colors
        }],
        labels: this.itemSellers.map(c => `${ c.name } x ${c.quantity}`)
      }
      // options: options
    });
  }

  setData(): void {
    this.itemSellers = new Array<ItemSeller>();
    this.itemSellersMap = new Map<number, ItemSeller>();

    this.auctions.forEach(auction => {
      if (this.itemSellersMap[this.getID(auction)]) {
        this.itemSellersMap[this.getID(auction)].quantity += auction.quantity;
      } else {
        const i = new ItemSeller(auction);
        this.itemSellersMap[this.getID(auction)] = i;
        this.itemSellers.push(i);
      }
    });
  }

  getID(auction: Auction): string {
    return `${ auction.owner }-${ auction.ownerRealm }`;
  }

  save(): void {
    localStorage[this.storageName] = this.chartTypeForm.value;
  }
}

class ItemSeller {
  sellerID: string;
  name: string;
  quantity = 1;

  constructor(item: Auction) {
    this.sellerID = `${ item.owner }-${ item.ownerRealm }`;
    this.name = item.owner;
  }
}
