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
export class ResetCalcComponent implements OnInit, OnDestroy {
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
      // this.calculate();
      Report.send('Calculated', 'Reset calc');
    });
  }

  ngOnInit(): void {
    if (this.auctionItem) {
      this.form.setValue(this.auctionItem.mktPrice * 1.5 / 10000);
    }
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
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
