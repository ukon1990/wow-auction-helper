import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ItemReset} from '../../models/item-reset.model';
import {ChartData} from '../../../util/models/chart.model';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {NumberUtil} from '../../../util/utils/number.util';
import {CraftingUtil} from '../../../crafting/utils/crafting.util';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-reset-charts',
  templateUrl: './reset-charts.component.html',
  styleUrls: ['./reset-charts.component.scss']
})
export class ResetChartsComponent implements OnChanges {
  @Input() itemID: number;
  @Input() newBuyout: number;
  @Input() namePrefix: string;
  @Input() sideBySide = false;
  @Output() resetPriceChange: EventEmitter<any> = new EventEmitter<any>();
  @Output()itemResetChange: EventEmitter<ItemReset> = new EventEmitter<ItemReset>();
  itemReset: ItemReset;
  auctionItem: AuctionItem;
  datasets: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  resetPrice = {
    numOfAuctions: 0,
    numOfItems: 0,
    cost: 0,
    roi: 0,
    breakEvenQuantity: 0
  };
  datasetsBreakpoints: ChartData;
  private goldPipe = new GoldPipe();

  constructor() {
  }

  ngOnChanges({newBuyout, itemID}: SimpleChanges) {
    console.log('onChanges', {newBuyout, itemID});
    if (itemID && itemID.currentValue) {
      this.auctionItem = SharedService.auctionItemsMap[itemID.currentValue];
      if (this.auctionItem) {
        this.itemReset = new ItemReset(this.auctionItem);
        this.itemResetChange.emit(this.itemReset);
        this.calculate();
      }
    }

    if (newBuyout && newBuyout.currentValue && this.auctionItem) {
      this.calculate(newBuyout.currentValue);
    }
  }

  calculate(newBuyout: number = this.newBuyout): void {
    if (!newBuyout || !this.auctionItem) {
      return;
    }
    this.resetToZero();

    this.auctionItem.auctions.forEach((a) => {
      if (a.buyout / a.quantity < newBuyout) {
        this.resetPrice.cost += a.buyout;
        this.resetPrice.numOfItems += a.quantity;
        this.resetPrice.numOfAuctions++;
      } else {
        return;
      }
    });

    this.resetPrice.roi = this.newBuyout * this.resetPrice.numOfItems - this.resetPrice.cost;
    this.resetPrice.roi *= CraftingUtil.ahCutModifier;
    this.resetPrice.breakEvenQuantity = Math.ceil(this.resetPrice.cost / newBuyout);

    this.setChartData(newBuyout);
    this.setBreakpointsChart();
    this.resetPriceChange.emit(this.resetPrice);
  }

  private resetToZero() {
    this.resetPrice.numOfAuctions = 0;
    this.resetPrice.numOfItems = 0;
    this.resetPrice.cost = 0;
    this.resetPrice.roi = 0;
    this.resetPrice.breakEvenQuantity = 0;
    this.datasets = {
      labels: [],
      axisLabels: {
        yAxis1: 'Sum',
        yAxis2: 'ROI',
        xAxis: 'Quantity'
      },
      datasets: [
        {
          label: 'Sum cost',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'hsla(0,100%,17%,0.33)'
        },
        {
          label: 'Sum buyout',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'hsla(110,100%,17%,0.71)'
        },
        {
          label: 'ROI',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-2',
          fill: false,
          backgroundColor: 'hsla(194,100%,17%,0.71)'
        },
      ],
      labelCallback: this.tooltipCallback
    };
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    const dataset = data.datasets[datasetIndex];
    return dataset.label + ': ' +
      new GoldPipe().transform(data.datasets[datasetIndex].data[index] * 10000);
  }

  private setChartData(newPrice: number) {
    let dataPoints = 50,
      increment = 1;
    if (this.resetPrice.numOfItems > dataPoints) {
      increment = Math.ceil(this.resetPrice.numOfItems / dataPoints);
    } else {
      dataPoints = this.resetPrice.numOfItems;
    }
    for (let i = 1; i <= dataPoints; i++) {
      const itemCount = i * increment;
      const quantity = itemCount > this.resetPrice.numOfItems ? this.resetPrice.numOfItems : itemCount;
      this.datasets.labels.push(NumberUtil.format((quantity), false));
      this.datasets.datasets[0].data.push(this.resetPrice.cost / 10000);
      this.datasets.datasets[1].data.push((newPrice * quantity) / 10000);
      this.datasets.datasets[2].data.push(((newPrice * quantity) - this.resetPrice.cost) / 10000);
    }
  }

  private setBreakpointsChart() {
    this.datasetsBreakpoints = {
      labels: [],
      axisLabels: {
        yAxis1: 'Gold',
        yAxis2: 'Quantity',
        xAxis: 'Target price'
      },
      datasets: [
        {
          label: 'ROI',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'hsla(132,100%,17%,0.5)'
        },
        {
          label: 'Cost',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-1',
          backgroundColor: 'hsla(0,100%,17%,0.33)'
        },
        {
          label: 'Quantity',
          data: [],
          type: 'line',
          yAxisID: 'yAxes-2',
          backgroundColor: 'hsla(194,100%,17%,0.71)'
        },
      ],
      labelCallback: this.tooltipCallback
    };
    this.itemReset.breakPoints.forEach(point => {
      this.datasetsBreakpoints.labels.push(this.goldPipe.transform(point.newBuyout));
      this.datasetsBreakpoints.datasets[0].data.push(point.potentialValue / 10000);
      this.datasetsBreakpoints.datasets[1].data.push(point.sumBuyout / 10000);
      this.datasetsBreakpoints.datasets[2].data.push(point.itemCount);
    });
  }

  tooltipCallbackBreakPoints(items, data): string {
    const {index, datasetIndex} = items,
      dataset = data.datasets[datasetIndex],
     value = data.datasets[datasetIndex].data[index];
    if (datasetIndex === 2) {
      return NumberUtil.format(value);
    }
    return dataset.label + ': ' +
      new GoldPipe().transform(value * 10000);
  }
}
