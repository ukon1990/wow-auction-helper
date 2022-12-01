import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import {UntypedFormControl} from '@angular/forms';
import {Subscription} from 'rxjs';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Report} from '../../../../utils/report.util';
import {ItemReset} from '../../models/item-reset.model';
import {ColumnDescription} from '@shared/models';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {getEstimatedSellTime} from "../../utils/reset.util";

@Component({
  selector: 'wah-reset-calc',
  templateUrl: './reset-calc.component.html',
  styleUrls: ['./reset-calc.component.scss']
})
export class ResetCalcComponent implements OnInit, OnDestroy {
  @Input() auctionItem: AuctionItem;
  @Input() dialogId:  string;
  pipe: GoldPipe = new GoldPipe();
  form: UntypedFormControl = new UntypedFormControl(0);
  resetPrice = {
    numOfAuctions: 0,
    numOfItems: 0,
    cost: 0,
    roi: 0,
    breakEvenQuantity: 0
  };
  itemReset: ItemReset;


  formChanges: Subscription;
  columns: ColumnDescription[] = [
    {key: 'id', title: '#', dataType: 'number'},
    {key: 'potentialProfitPercent', title: 'ROI %', dataType: 'percent'},
    {key: 'potentialProfit', title: 'Profit', dataType: 'gold'},
    {key: 'newBuyout', title: 'New buyout', dataType: 'gold'},
    {key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'},
    {key: 'sumBuyout', title: 'Total cost', dataType: 'gold'},
    {key: 'sellTime', title: 'Est days to sell', dataType: 'number'},
  ];

  constructor() {
    this.formChanges = this.form.valueChanges.subscribe(() => {
      Report.send('Calculated', 'Reset calc');
    });
  }

  ngOnInit(): void {
    if (this.auctionItem) {
      const baseValue = this.auctionItem.buyout || this.auctionItem.mktPrice;
      this.form.setValue((baseValue) * 1.5 / 10000);
    }
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  get timeToSell(): number {
    return getEstimatedSellTime(this.auctionItem, this.resetPrice.numOfItems);
  }

  get timeToBreakEven(): number {
    const salePct = this.auctionItem.stats?.tsm.salePct || 0;
    const numberOfItems = this.resetPrice.breakEvenQuantity;
    const avgDailySold = this.auctionItem.stats ?
      this.auctionItem.stats.tsm.soldPerDay : 0;

    return numberOfItems / salePct / avgDailySold;
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
}