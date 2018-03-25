import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ColumnDescription } from '../../../models/column-description';
import { MarketResetCost } from '../../../models/auction/market-reset-cost';
import { Filters } from '../../../models/filtering';
import { Auction } from '../../../models/auction/auction';

@Component({
  selector: 'wah-market-reset',
  templateUrl: './market-reset.component.html',
  styleUrls: ['./market-reset.component.scss']
})
export class MarketResetComponent implements OnInit {
  form: FormGroup;
  columns: Array<ColumnDescription> = new Array<ColumnDescription>();
  data: Array<MarketResetCost> = new Array<MarketResetCost>();
  checkInterval;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      name: null,
      costLimit: null,
      maxItemCount: null,
      minimumProfit: 0,
      avgDailySold: 10,
      saleRate: 20,
    });

    this.form.valueChanges.subscribe(() =>
      this.setResults());
  }

  ngOnInit() {
    this.addColumns();

    this.checkInterval = setInterval(() => {
      if (SharedService.auctions.length > 0) {
        clearInterval(this.checkInterval);
        setTimeout(this.setResults(), 100);
      }
    }, 1000);
  }

  addColumns(): void {
    this.columns.push({ key: 'name', title: 'Name', dataType: 'name' });
    this.columns.push({ key: 'auctionCount', title: 'Auction count', dataType: 'number' });
    this.columns.push({ key: 'itemCount', title: 'Item count', dataType: 'number' });
    this.columns.push({ key: 'cost', title: 'Cost', dataType: 'gold' });
    this.columns.push({ key: 'avgItemCost', title: 'Avg cost per item', dataType: 'gold' });
    this.columns.push({ key: 'targetPrice', title: 'Target price', dataType: 'gold' });
    this.columns.push({ key: 'roi', title: 'Potential profit', dataType: 'gold' });

    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true });
  }

  setResults() {
    let tmpItem: MarketResetCost;
    this.data = SharedService.auctionItems.map(ai => {
      if (Filters.isNameMatch(ai.itemID, this.form) &&
        Filters.isDailySoldMatch(ai.itemID, this.form) &&
        Filters.isSaleRateMatch(ai.itemID, this.form)) {
        tmpItem = new MarketResetCost();
        tmpItem.itemID = ai.itemID;
        tmpItem.targetPrice = ai.mktPrice;

        ai.auctions.forEach(a => {
          if (this.isTargetPriceMatch(a, tmpItem) &&
            this.isCountMatch(a, tmpItem) &&
            this.isMaxCostMatch(a, tmpItem)) {

            tmpItem.auctionCount++;
            tmpItem.itemCount += a.quantity;
            tmpItem.cost += a.buyout;
          }
        });
        tmpItem.avgItemCost = tmpItem.cost / tmpItem.itemCount;
        tmpItem.roi = tmpItem.targetPrice * tmpItem.itemCount - tmpItem.cost;

        if (tmpItem.roi > 0 && tmpItem.roi / tmpItem.cost * 100 >= this.form.value.minimumProfit) {
          return tmpItem;
        }
      }
    });
  }

  isTargetPriceMatch(auction: Auction, mrc: MarketResetCost): boolean {
    return auction.buyout / auction.quantity < mrc.targetPrice;
  }

  isCountMatch(auction: Auction, mrc: MarketResetCost): boolean {
    return this.form.value.maxItemCount === null || mrc.itemCount + auction.quantity <= this.form.value.maxItemCount;
  }

  isMaxCostMatch(auction: Auction, mrc: MarketResetCost): boolean {
    if (this.form.value.costLimit === null || mrc.cost + auction.buyout <= this.form.value.costLimit * 10000) {
      return true;
    }
    return false;
  }
}
