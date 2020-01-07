import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {Filters} from '../../../../utils/filtering';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {ItemReset} from '../../models/item-reset.model';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';
import {EmptyUtil} from '@ukon1990/js-utilities';
import {Report} from '../../../../utils/report.util';
import {RowClickEvent} from '../../../table/models/row-click-event.model';

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
    breakPointPercent: 101.01,
    mktPriceUpperThreshold: 400,
    minROI: 0,
    minROIPercent: 125,
    maxTotalBuyoutPerItem: undefined,
    useHighestROIResult: true,
    newVsCurrentBuyoutPriceLimit: 400
  };
  data = [];
  sm = new SubscriptionManager();
  tsmShoppingString = '';
  pipe = new GoldPipe();
  columns: ColumnDescription[] = [];

  sum = {
    sumCost: 0,
    potentialProfit: 0,
    itemsToBuy: 0,
    auctionsToBuy: 0
  };
  rowShoppingString = '';

  constructor(private formBuilder: FormBuilder) {
    SharedService.events.title.next('Market resetter');
    const query = this.getQuery();
    this.form = this.formBuilder.group({
      name: new FormControl(
        query.name || this.formDefaults.name),
      timeToSell: new FormControl(query.timeToSell),
      breakPointPercent: new FormControl(query.breakPointPercent),
      mktPriceUpperThreshold: new FormControl(query.mktPriceUpperThreshold),
      minROI: new FormControl(query.minROI),
      minROIPercent: new FormControl(query.minROIPercent),
      maxTotalBuyoutPerItem: new FormControl(query.maxTotalBuyoutPerItem),
      useHighestROIResult: new FormControl(query.useHighestROIResult),
      newVsCurrentBuyoutPriceLimit: new FormControl(query.newVsCurrentBuyoutPriceLimit)
    });

    this.form.valueChanges.subscribe((form) => {
      localStorage['query_market_reset'] = JSON.stringify(this.form.value);
      this.filter(form);
    });
  }

  private getQuery() {
    const queryString = localStorage['query_market_reset'];
    const query = queryString ? JSON.parse(queryString) : this.formDefaults;

    Object.keys(query)
      .forEach(key => {
        if (query[key] === undefined) {
          query[key] = this.formDefaults[key];
        }
      });

    Report.debug('getQuery', query);
    return query;
  }

  ngOnInit() {
    this.setColumns();
    this.filter(this.form.getRawValue());

    this.sm.add(SharedService.events.auctionUpdate,
      (auctionItems: AuctionItem[]) => {
        this.filter(this.form.getRawValue());
      });
  }

  private filter(query: any) {
    const strings = [];
    const results = [];

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
            this.isMaxTotalBuyoutPerItemMatch(query, bp) &&
            this.isHigherROIThanPrevious(query, bp, matchPoint) &&
            this.isNewVsCurrentBuyoutPriceLimit(query, bp)) {
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
      this.handleMatch(matchPoint, strings, results);
    });
    this.tsmShoppingString = strings.join(';');
    this.data = [...results];

    Report.send('filter - market reset values', 'MarketResetComponent', JSON.stringify(query));
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

  private handleMatch(bp: ItemResetBreakpoint, strings, results: any[]) {
    if (bp) {
      this.sum.auctionsToBuy += bp.auctionCount;
      this.sum.itemsToBuy += bp.itemCount;
      this.sum.potentialProfit += bp.potentialProfit;
      this.sum.sumCost += bp.sumBuyout;

      strings.push(bp.tsmShoppingString);
      results.push(bp);
    }
  }

  setRoShoppingString({row}: RowClickEvent<ItemResetBreakpoint>): void {
    this.rowShoppingString = row.tsmShoppingString;
  }

  resetForm() {
    this.form.reset(this.formDefaults);
  }

  private isHigherROIThanPrevious(query: any, bp: ItemResetBreakpoint, matchPoint: any) {
    if (!(!matchPoint || !query.useHighestROIResult || EmptyUtil.isNullOrUndefined(query.useHighestROIResult))) {
      return bp.potentialProfitPercent > matchPoint.potentialProfitPercent;
    } else {
      return true;
    }
  }

  private isNewVsCurrentBuyoutPriceLimit(query: any, bp: ItemResetBreakpoint) {
    if (!query.newVsCurrentBuyoutPriceLimit || EmptyUtil.isNullOrUndefined(query.newVsCurrentBuyoutPriceLimit)) {
      return true;
    }
    return bp.newVsCurrentBuyoutPercent < query.newVsCurrentBuyoutPriceLimit / 100;
  }

  private setColumns() {
    this.columns.push({key: 'name', title: 'Name', dataType: 'name'});
    this.columns.push({key: 'potentialProfitPercent', title: 'ROI %', dataType: 'percent'});
    this.columns.push({key: 'potentialProfit', title: 'Profit', dataType: 'gold'});
    this.columns.push({key: 'newBuyout', title: 'New buyout', dataType: 'gold'});

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({key: 'percentOfMkt', title: 'New vs mkt price', dataType: 'percent'});
    }
    this.columns.push({key: 'newVsCurrentBuyoutPercent', title: 'New vs current', dataType: 'percent'});
    this.columns.push({key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'});
    this.columns.push({key: 'sumBuyout', title: 'Total cost', dataType: 'gold'});
    this.columns.push({key: 'potentialValue', title: 'Sum potential value', dataType: 'gold'});
    this.columns.push({key: 'auctionCount', title: '# Auctions', dataType: 'number'});
    this.columns.push({key: 'itemCount', title: '# Item', dataType: 'number'});

    if (SharedService.user.apiToUse !== 'none') {
      this.columns.push({key: 'sellTime', title: 'Sell time(maybe)', dataType: 'number'});
    }
  }
}
