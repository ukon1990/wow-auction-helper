import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { ColumnDescription } from '../../../models/column-description';
import { MarketResetCost } from '../../../models/auction/market-reset-cost';
import { Filters } from '../../../models/filtering';
import { Auction } from '../../../models/auction/auction';
import { AuctionItem } from '../../../models/auction/auction-item';
import { GoldPipe } from '../../../pipes/gold.pipe';
import { Angulartics2 } from 'angulartics2';

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
  tsmShoppingString = '';
  pipe = new GoldPipe();

  sum = {
    sumCost: 0,
    potentialProfit: 0,
    itemsToBuy: 0,
    auctionsToBuy: 0
  };

  constructor(private formBuilder: FormBuilder, private angulartics2: Angulartics2) {
    const query = localStorage['query_market_reset'] ?
      JSON.parse(localStorage['query_market_reset']) : undefined;
    this.form = this.formBuilder.group({
      name: query && query.name !== undefined ? query.name : null,
      costLimit: null, // query && query.costLimit !== undefined ? query.costLimit : null,
      maxItemCount: null, // query && query.maxItemCount !== undefined ? query.maxItemCount : null,
      minimumProfit: query && query.minimumProfit !== undefined ? query.minimumProfit : 30,
      avgDailySold: query && query.avgDailySold !== undefined ? query.avgDailySold : 10,
      saleRate: query && query.saleRate !== undefined ? query.saleRate : 20,
      targetMVPercent: query && query.targetMVPercent !== undefined ? query.targetMVPercent : 100
    });

    this.form.valueChanges.subscribe(() => {
      this.setResults();
      localStorage['query_market_reset'] = JSON.stringify(this.form.value);
    });
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

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({ key: 'avgDailySold', title: 'Daily sold', dataType: 'number', hideOnMobile: true });
      this.columns.push({ key: 'regionSaleRate', title: 'Sale rate', dataType: 'percent', hideOnMobile: true });
    }

    this.columns.push({ key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info'], hideOnMobile: true });
  }

  setResults() {
    this.angulartics2.eventTrack.next({
      action: 'Calculated',
      properties: { category: 'Market reset calc' },
    });

    let tmpItem: MarketResetCost;
    this.sum = {
      sumCost: 0,
      potentialProfit: 0,
      itemsToBuy: 0,
      auctionsToBuy: 0
    };

    this.data.length = 0;
    SharedService.auctionItems.forEach(ai => {
      if (Filters.isNameMatch(ai.itemID, this.form) &&
        Filters.isDailySoldMatch(ai.itemID, this.form) &&
        Filters.isSaleRateMatch(ai.itemID, this.form)) {
        tmpItem = new MarketResetCost();
        tmpItem.itemID = ai.itemID;
        tmpItem.name = ai.name;
        tmpItem.targetPrice = this.getTargetMVPrice(ai);

        ai.auctions.forEach((a, i) => {
          if (this.isTargetPriceMatch(a, tmpItem) &&
            this.isCountMatch(a, tmpItem) &&
            this.isMaxCostMatch(a, tmpItem)) {

            tmpItem.auctionCount++;
            tmpItem.itemCount += a.quantity;
            tmpItem.cost += a.buyout;

            if (!this.isCountMatch(ai.auctions[i + 1], tmpItem) || !this.isMaxCostMatch(ai.auctions[i + 1], tmpItem)) {
              tmpItem.targetPrice = ai.auctions[i + 1].buyout / ai.auctions[i + 1].quantity;
            }
          }
        });

        tmpItem.avgItemCost = tmpItem.cost / tmpItem.itemCount;
        // Adding AH cut
        tmpItem.cost = tmpItem.cost * 1.05;

        tmpItem.roi = tmpItem.targetPrice * tmpItem.itemCount - tmpItem.cost;

        if (tmpItem.cost > 0 && this.isMinimumProfitPercentMatch(tmpItem)) {
          this.sum.auctionsToBuy += tmpItem.auctionCount;
          this.sum.itemsToBuy += tmpItem.itemCount;
          this.sum.sumCost += tmpItem.cost;
          this.sum.potentialProfit += tmpItem.roi;
          this.data.push(tmpItem);
        }
      }
    });

    this.tsmShoppingString = '';
    this.data.forEach(mrc => {
      this.tsmShoppingString += `${
        SharedService.items[mrc.itemID].name
      }/exact/1c/${
        this.pipe.transform(mrc.targetPrice - 1 ).replace(',', '')
      };`;
    });

    if (this.tsmShoppingString.endsWith(';')) {
      this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
    }
  }

  getTargetMVPrice(auctionItem: AuctionItem): number {
    return this.form.value.targetMVPercent === null ?
      auctionItem.mktPrice : auctionItem.mktPrice * (this.form.value.targetMVPercent / 100);
  }

  isMinimumProfitPercentMatch(mrc: MarketResetCost): boolean {
    return this.form.value.minimumProfit === null || mrc.roi / mrc.cost * 100 >= this.form.value.minimumProfit;
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

  hasDefinedAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }
}
