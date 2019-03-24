import {AfterContentInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProfitSummary, UserProfit} from '../../../utils/tsm-lua.util';
import {ColumnDescription} from '../../../models/column-description';
import {SharedService} from '../../../services/shared.service';
import {FormControl} from '@angular/forms';
import {SubscriptionsUtil} from '../../../utils/subscriptions.util';

@Component({
  selector: 'wah-item-sale-summary',
  templateUrl: './item-sale-summary.component.html',
  styleUrls: ['./item-sale-summary.component.scss']
})
export class ItemSaleSummaryComponent implements AfterContentInit, OnDestroy {
  @Input() itemId: number;
  realm: string;
  columns: ColumnDescription[] = [
    {key: 'category', title: 'Category', dataType: 'string'},
    {key: 'quantity', title: 'Quantity', dataType: 'number'},
    {key: 'minPrice', title: 'Min buyout', dataType: 'gold'},
    {key: 'maxPrice', title: 'Max buyout', dataType: 'gold'},
    {key: 'avgPrice', title: 'Avg buyout', dataType: 'gold'},
    {key: 'totalPrice', title: 'Sum', dataType: 'gold'}
  ];
  data = [];
  dataSets = [
    {key: 'past24Hours', title: 'Past 24 hours'},
    {key: 'past7Days', title: 'Past 7 days'},
    {key: 'past14Days', title: 'Past 14 days'},
    {key: 'past30Days', title: 'Past 30 days'},
    {key: 'past90Days', title: 'Past 90 days'},
    {key: 'total', title: 'All'}
  ];
  field = new FormControl('past14Days');
  subscriptions = new SubscriptionsUtil();
  allData = SharedService.tsmAddonData;
  personalSaleRate = 0;

  constructor() {
    this.subscriptions.add(
      this.field.valueChanges,
      (setKey) =>
        this.setData(setKey));
  }

  ngAfterContentInit() {
    this.realm = SharedService.realms[SharedService.user.realm].name;
    this.setData(this.field.value);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setData(setKey: string): void {
    if (!this.realm) {
      return;
    }
    const realms = SharedService.tsmAddonData['profitSummary'];
    if (realms && realms[this.realm]) {
      const dataset = ((realms[this.realm] as ProfitSummary)[setKey] as UserProfit),
        sales = dataset.sales.itemMap[this.itemId],
        purchases = dataset.purchases.itemMap[this.itemId],
        expired = dataset.expired.itemMap[this.itemId],
        cancelled = dataset.cancelled.itemMap[this.itemId];
      let total = 0, plus = 0;
      this.data.length = 0;

      if (sales) {
        this.data.push(sales);
        plus += sales.quantity;
        total += sales.quantity;
      }
      if (purchases) {
        this.data.push(purchases);
      }

      if (expired) {
        this.data.push(expired);
        total += expired.quantity;
      }

      if (cancelled) {
        this.data.push(cancelled);
        total += cancelled.quantity;
      }

      this.personalSaleRate = plus / total;
    }
  }
}
