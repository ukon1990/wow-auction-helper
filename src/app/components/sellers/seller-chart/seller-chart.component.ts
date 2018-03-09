import { Component, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import { Seller } from '../../../models/seller';
import { itemClasses } from '../../../models/item/item-classes';
import { Auction } from '../../../models/auction/auction';
import { SharedService } from '../../../services/shared.service';
import { Item } from '../../../models/item/item';

@Component({
  selector: 'wah-seller-chart',
  templateUrl: './seller-chart.component.html',
  styleUrls: ['./seller-chart.component.scss']
})
export class SellerChartComponent implements OnChanges, AfterViewInit {
  @Input() seller: Seller;
  itemClasses: Array<AuctionClassGroup>;
  itemClassesMap: Map<number, AuctionClassGroup>;
  labels: Array<string> = new Array<string>();
  chart: Chart;

  constructor() { }

  ngAfterViewInit(): void {
    this.setData();
    this.setChart(this.itemClasses);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      this.setData();
      console.log(this.itemClassesMap);
      this.setChart(this.itemClasses);
    }, 100);
  }

  setChart(data: Array<any>): void {
    this.chart = new Chart('donut-chart', {
      type: 'doughnut',
      data: {
        datasets: [{
          data: this.itemClasses.map(c => c.quantity)
        }],
        labels: this.itemClasses.map(c => `${ c.name } x ${c.quantity}`),
        backgroundColor: ['red', 'green', 'yellow', 'blue', 'purple']
      }
      // options: options
    });
  }

  setData(): void {
    this.itemClasses = new Array<AuctionClassGroup>();
    this.itemClassesMap = new Map<number, AuctionClassGroup>();

    this.seller.auctions.forEach(auction => {
      const item = SharedService.items[auction.item] as Item;
      if (!item) {
        return;
      }
      if (this.itemClassesMap[item.itemClass]) {
        this.itemClassesMap[item.itemClass].quantity++;
        this.itemClassesMap[item.itemClass].auctions.push(auction);
      } else {
        const i = new AuctionClassGroup(item);
        this.itemClassesMap[item.itemClass] = i;
        this.itemClasses.push(i);
      }
    });
    itemClasses.classes.forEach(c => {
      if (this.itemClassesMap[c.class]) {
        this.itemClassesMap[c.class].name = c.name;
      }
    });
  }
}

class AuctionClassGroup {
  id: number;
  name = '';
  auctions: Array<Auction> = new Array<Auction>();
  quantity = 1;

  constructor(item: Item) {
    this.id = item.itemClass;
  }
}
