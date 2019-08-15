import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {Filters} from '../../../../utils/filtering';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemReset} from '../../models/item-reset.model';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'wah-market-reset',
  templateUrl: './market-reset.component.html',
  styleUrls: ['./market-reset.component.scss']
})
export class MarketResetComponent implements OnInit {
  hasDefinedAPI = SharedService.user.apiToUse !== 'none';
  form: FormGroup;
  formDefaults = {
    name: '',
    timeToSell: 10,
    breakPointPercent: 110,
    mktPriceUpperThreshold: 400,
    minROI: 0,
    minROIPercent: 125,
    maxTotalBuyoutPerItem: undefined
  };
  data = [];
  sm = new SubscriptionManager();
  tsmShoppingString = '';
  pipe = new GoldPipe();
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'potentialProfitPercent', title: 'ROI %', dataType: 'percent'},
    {key: 'potentialProfit', title: 'Profit', dataType: 'gold'},
    {key: 'newBuyout', title: 'New buyout', dataType: 'gold'},
    {key: 'percentOfMkt', title: 'New vs mkt price', dataType: 'percent'},
    {key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'},
    {key: 'sumBuyout', title: 'Total cost', dataType: 'gold'},
    {key: 'potentialValue', title: 'Sum potential value', dataType: 'gold'},
    {key: 'sellTime', title: 'Sell time(maybe)', dataType: 'number'},
  ];

  sum = {
    sumCost: 0,
    potentialProfit: 0,
    itemsToBuy: 0,
    auctionsToBuy: 0
  };
  rowShoppingString = '';

  constructor(private formBuilder: FormBuilder) {
    SharedService.events.title.next('Market resetter');
    const query = localStorage['query_market_reset'] ?
      JSON.parse(localStorage['query_market_reset']) : undefined;
    this.form = this.formBuilder.group({
      name: new FormControl(
        query.name || this.formDefaults.name),
      timeToSell: new FormControl(
        query.timeToSell || this.formDefaults.timeToSell),
      breakPointPercent: new FormControl(
        query.breakPointPercent || this.formDefaults.breakPointPercent),
      mktPriceUpperThreshold: new FormControl(
        query.mktPriceUpperThreshold || this.formDefaults.mktPriceUpperThreshold),
      minROI: new FormControl(
        query.minROI || this.formDefaults.minROI),
      minROIPercent: new FormControl(
        query.minROIPercent || this.formDefaults.minROIPercent),
      maxTotalBuyoutPerItem: new FormControl(
        query.maxTotalBuyoutPerItem || this.formDefaults.maxTotalBuyoutPerItem)
    });

    this.form.valueChanges.subscribe((form) => {
      localStorage['query_market_reset'] = JSON.stringify(this.form.value);
      this.filter(form);
    });
  }

  ngOnInit() {
    this.sm.add(SharedService.events.auctionUpdate,
      (auctionItems: AuctionItem[]) => {
        console.log('Auction event', SharedService.auctionItems.length);
        this.filter(this.form.getRawValue());
      });
  }

  private filter(query: any) {
    const strings = [];

    this.sum.auctionsToBuy = 0;
    this.sum.itemsToBuy = 0;
    this.sum.potentialProfit = 0;
    this.sum.sumCost = 0;

    this.data.length = 0;
    this.tsmShoppingString = '';
    this.rowShoppingString = '';

    SharedService.auctionItems.forEach(ai => {
      if (!Filters.isNameMatch(ai.itemID, query.name)) {
        return;
      }

      const item: ItemReset = new ItemReset(ai, query.breakPointPercent / 100);
      let matchPoint;
      for (let i = 0, l = item.breakPoints.length; i < l; i++) {
        const bp = item.breakPoints[i];
        if (bp && bp.potentialProfit > 0) {

          if (this.isSellTimeMatch(bp, query) &&
            this.isMktPriceThreasholdMatch(bp, query, ai) &&
            this.isMinROIMatch(query, bp) &&
            this.isMinROIPercentMatch(query, bp) &&
            this.isMaxTotalBuyoutPerItemMatch(query, bp)) {
            matchPoint = {
              itemID: item.id,
              name: item.name,
              icon: item.icon,
              percentOfMkt: bp.newBuyout / ai.mktPrice,
              ...bp
            };
          }
        }
      }
      this.handleMatch(matchPoint, strings);
    });
    this.tsmShoppingString = strings.join(';');
  }

  private isSellTimeMatch(bp, query: any) {
    if (!this.hasDefinedAPI) {
      return true;
    }
    return Filters.isXSmallerThanOrEqualToY(bp.sellTime, query.timeToSell);
  }

  private isMinROIMatch(query: any, bp) {
    return Filters.isXSmallerThanOrEqualToY(
      query.minROI ? query.minROI * 10000 : 0,
      bp.potentialProfit);
  }

  private isMktPriceThreasholdMatch(bp, query: any, ai) {
    if (!this.hasDefinedAPI || query.mktPriceUpperThreshold === null || !query.mktPriceUpperThreshold) {
      return true;
    }
    return Filters.isXSmallerThanOrEqualToY(bp.newBuyout, (query.mktPriceUpperThreshold / 100) * ai.mktPrice);
  }

  private isMinROIPercentMatch(query: any, bp: ItemResetBreakpoint) {
    return Filters.isXSmallerThanOrEqualToY(
      query.minROIPercent ? query.minROIPercent / 100 : 0,
      bp.potentialProfitPercent);
  }

  private isMaxTotalBuyoutPerItemMatch(query: any, bp: ItemResetBreakpoint) {
    if (query.maxTotalBuyoutPerItem === null || !query.maxTotalBuyoutPerItem) {
      return true;
    }
    return Filters.isXSmallerThanOrEqualToY(
      bp.sumBuyout,
      query.maxTotalBuyoutPerItem ? query.maxTotalBuyoutPerItem * 10000 : undefined);
  }

  private handleMatch(bp, strings) {
    if (bp) {
      this.sum.auctionsToBuy += bp.auctionCount;
      this.sum.itemsToBuy += bp.itemCount;
      this.sum.potentialProfit += bp.potentialProfit;
      this.sum.sumCost += bp.sumBuyout;

      strings.push(bp.tsmShoppingString);
      this.data.push(bp);
    }
  }

  setRoShoppingString(row: ItemResetBreakpoint): void {
    this.rowShoppingString = row.tsmShoppingString;
  }

  resetForm() {
    this.form.reset(this.formDefaults);
  }

}
