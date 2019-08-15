import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';

import {FormControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Crafting} from '../../../crafting/models/crafting';
import {Report} from '../../../../utils/report.util';
import {ItemReset} from '../../models/item-reset.model';
import {ColumnDescription} from '../../../table/models/column-description';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';

@Component({
  selector: 'wah-reset-calc',
  templateUrl: './reset-calc.component.html',
  styleUrls: ['./reset-calc.component.scss']
})
export class ResetCalcComponent implements OnInit, OnDestroy, OnChanges {
  @Input() auctionItem: AuctionItem;
  pipe: GoldPipe = new GoldPipe();
  form: FormControl = new FormControl(0);
  usingAPI = SharedService.user.apiToUse !== 'none';
  resetPrice = {
    numOfAuctions: 0,
    numOfItems: 0,
    cost: 0,
    roi: 0
  };
  itemReset: ItemReset;

  formChanges: Subscription;
  columns: ColumnDescription[] = [
    {key: 'id', title: '#', dataType: 'number'},
    {key: 'potentialProfitPercent', title: 'Profit %', dataType: 'percent'},
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
      this.form.setValue(this.auctionItem.mktPrice / 10000);
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
    this.resetPrice.numOfAuctions = 0;
    this.resetPrice.numOfItems = 0;
    this.resetPrice.cost = 0;
    this.resetPrice.roi = 0;

    this.auctionItem.auctions.forEach((a) => {
      if (a.buyout / a.quantity < (this.form.value * 10000)) {
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
    this.resetPrice.roi *= Crafting.ahCutModifier;
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

  handleRowClick(d: ItemResetBreakpoint): void {
    this.form.setValue(d.newBuyout / 10000);
  }
}
