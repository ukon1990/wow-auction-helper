import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';

import {FormControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {CraftingUtil} from '../../../crafting/utils/crafting.util';
import {Report} from '../../../../utils/report.util';
import {ItemReset} from '../../models/item-reset.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {ChartData} from '../../../util/models/chart.model';
import {NumberUtil} from '../../../util/utils/number.util';

@Component({
  selector: 'wah-reset-calc',
  templateUrl: './reset-calc.component.html',
  styleUrls: ['./reset-calc.component.scss']
})
export class ResetCalcComponent implements OnInit, OnDestroy, OnChanges {
  @Input() auctionItem: AuctionItem;
  pipe: GoldPipe = new GoldPipe();
  form: FormControl = new FormControl(0);
  resetPrice = {
    numOfAuctions: 0,
    numOfItems: 0,
    cost: 0,
    roi: 0,
    breakEvenQuantity: 0
  };
  itemReset: ItemReset;
  datasets: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };

  formChanges: Subscription;
  columns: ColumnDescription[] = [
    {key: 'id', title: '#', dataType: 'number'},
    {key: 'potentialProfitPercent', title: 'ROI %', dataType: 'percent'},
    {key: 'potentialProfit', title: 'Profit', dataType: 'gold'},
    {key: 'newBuyout', title: 'New buyout', dataType: 'gold'},
    {key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'},
    {key: 'sumBuyout', title: 'Total cost', dataType: 'gold'},
    {key: 'sellTime', title: 'Sell time(maybe)', dataType: 'number'},
  ];

  constructor() {
    this.formChanges = this.form.valueChanges.subscribe(() => {
      this.calculate();
      Report.send('Calculated', 'Reset calc');
    });
  }

  ngOnInit(): void {
    if (this.auctionItem) {
      this.form.setValue(this.auctionItem.mktPrice * 1.5 / 10000);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.auctionItem && changes.auctionItem.currentValue) {
      this.itemReset = new ItemReset(changes.auctionItem.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  calculate(): void {
    if (!this.form.value) {
      return;
    }
    const newPrice = this.form.value * 10000;
    this.resetToZero();

    this.auctionItem.auctions.forEach((a) => {
      if (a.buyout / a.quantity < newPrice) {
        this.resetPrice.cost += a.buyout;
        this.resetPrice.numOfItems += a.quantity;
        this.resetPrice.numOfAuctions++;
      } else {
        return;
      }
    });

    // Adding AH cut to the cost value
    this.resetPrice.cost = this.resetPrice.cost;

    this.resetPrice.roi = (this.form.value * 10000) * this.resetPrice.numOfItems - this.resetPrice.cost;
    this.resetPrice.roi *= CraftingUtil.ahCutModifier;
    this.resetPrice.breakEvenQuantity = Math.ceil(this.resetPrice.cost / newPrice);

    this.setChartData(newPrice);
  }

  private resetToZero() {
    this.resetPrice.numOfAuctions = 0;
    this.resetPrice.numOfItems = 0;
    this.resetPrice.cost = 0;
    this.resetPrice.roi = 0;
    this.resetPrice.breakEvenQuantity = 0;
    this.datasets = {
      labels: [],
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

  getShoppingString(): string {
    return `${
      this.auctionItem.name
    }/exact/${
      this.pipe.transform(1)
    }/${
      this.pipe.transform((this.form.value * 10000) - 1).replace(',', '')
    }`;
  }

  handleRowClick({row}: RowClickEvent<ItemResetBreakpoint>): void {
    this.form.setValue(row.newBuyout / 10000);
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
}
