import { Component, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import * as distinctColors from 'distinct-colors';
import { Seller } from '../../../models/seller';
import { itemClasses } from '../../../models/item/item-classes';
import { Auction } from '../../../models/auction/auction';
import { SharedService } from '../../../services/shared.service';
import { Item } from '../../../models/item/item';
import { FormControl } from '@angular/forms';

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
  chartTypeForm: FormControl = new FormControl();
  storageName = 'seller-chart';
  colors;

  constructor() {
    this.chartTypeForm.setValue(
      localStorage[this.storageName] ? localStorage[this.storageName] : 'doughnut');
    this.chartTypeForm.valueChanges.subscribe(type => {
      setTimeout(() => {
        this.save();
        this.setChart(this.itemClasses);
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    this.setData();
    this.setChart(this.itemClasses);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      this.colors = distinctColors({ count: this.itemClasses.length });
      this.setData();
      console.log(this.itemClassesMap);
      this.setChart(this.itemClasses);
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
          data: this.itemClasses.map(c => c.quantity),
          backgroundColor: this.colors
        }],
        labels: this.itemClasses.map(c => `${ c.name } x ${c.quantity}`)
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
      if (this.itemClassesMap[this.getClassIDForItem(item)]) {
        this.itemClassesMap[this.getClassIDForItem(item)].quantity++;
        this.itemClassesMap[this.getClassIDForItem(item)].auctions.push(auction);
      } else {
        const i = new AuctionClassGroup(item);
        this.itemClassesMap[this.getClassIDForItem(item)] = i;
        this.itemClasses.push(i);
      }
    });
    itemClasses.classes.forEach(c => {
      c.subclasses.forEach(sc => {
        const id = `${ c.class }-${ sc.subclass }`;

        if (this.itemClassesMap[id]) {
          this.itemClassesMap[id].name = `${ sc.name } - ${c.name}`;
        }
      });
    });
  }

  getClassIDForItem(item: Item): string {
    return `${ item.itemClass }-${ item.itemSubClass }`;
  }

  save(): void {
    localStorage[this.storageName] = this.chartTypeForm.value;
  }
}

class AuctionClassGroup {
  itemClass: number;
  itemSubClass: number;
  name = '';
  auctions: Array<Auction> = new Array<Auction>();
  quantity = 1;

  constructor(item: Item) {
    this.itemClass = item.itemClass;
    this.itemSubClass = item.itemSubClass;
  }
}
