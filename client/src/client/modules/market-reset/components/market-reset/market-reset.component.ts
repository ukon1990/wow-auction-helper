import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {Filters} from '../../../../utils/filtering';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ItemReset} from '../../models/item-reset.model';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';
import {EmptyUtil} from '@ukon1990/js-utilities';
import {Report} from '../../../../utils/report.util';
import {RowClickEvent} from '../../../table/models/row-click-event.model';
import {AuctionsService} from '../../../../services/auctions.service';
import {columnConfig} from '../../../dashboard/data/columns.data';
import {GameBuild} from '../../../../utils/game-build.util';
import {ItemClass} from '../../../item/models/item-class.model';
import {ItemClassService} from '../../../item/service/item-class.service';
import {RealmService} from '../../../../services/realm.service';

@Component({
  selector: 'wah-market-reset',
  templateUrl: './market-reset.component.html',
  styleUrls: ['./market-reset.component.scss']
})
export class MarketResetComponent implements OnInit {
  form: FormGroup;
  formDefaults = {
    name: '',
    timeToSell: 10, // Dependent on TSM
    breakPointPercent: 101.01,
    mktPriceUpperThreshold: 400,
    minROI: 0,
    minROIPercent: 125,
    maxTotalBuyoutPerItem: undefined,
    useHighestROIResult: true,
    newVsCurrentBuyoutPriceLimit: 400
  };
  itemClasses: ItemClass[] = ItemClassService.getForLocale();
  expansions = GameBuild.expansionMap;
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
  itemResetBreakpoint: ItemResetBreakpoint;
  toValueGold = {
    minROI: 0,
    maxTotalBuyoutPerItem: 0,
  };
  private lastCharacterTyped: number;
  private lastCalculationTime: number;

  constructor(
    private formBuilder: FormBuilder,
    private auctionService: AuctionsService,
    private realmService: RealmService
  ) {
    SharedService.events.title.next('Market resetter');
    const query = this.getQuery();
    this.form = this.formBuilder.group({
      name: new FormControl(
        query.name || this.formDefaults.name),
      timeToSell: new FormControl(query.timeToSell),
      breakPointPercent: new FormControl(query.breakPointPercent),
      expansion: new FormControl(query.expansion),
      itemClass: new FormControl(query.itemClass),
      itemSubClass: new FormControl(query.itemSubClass),
      mktPriceUpperThreshold: new FormControl(query.mktPriceUpperThreshold),
      minROI: new FormControl(query.minROI),
      minROIPercent: new FormControl(query.minROIPercent),
      maxTotalBuyoutPerItem: new FormControl(query.maxTotalBuyoutPerItem),
      useHighestROIResult: new FormControl(query.useHighestROIResult),
      newVsCurrentBuyoutPriceLimit: new FormControl(query.newVsCurrentBuyoutPriceLimit)
    });

    this.sm.add(this.form.valueChanges,
      (form) => {
        this.lastCalculationTime = +new Date();
        setTimeout(() => {
          const timeDiff = +new Date() - this.lastCalculationTime;
          if (timeDiff >= 500) {
            localStorage['query_market_reset'] = JSON.stringify(this.form.value);
            this.filter(form);
          }
        }, 500);
      });
  }

  private getQuery() {
    const queryString = localStorage['query_market_reset'];
    const query = queryString ? JSON.parse(queryString) : this.formDefaults;

    Object.keys(query)
      .forEach(key => {
        if (query[key] === undefined) {
          query[key] = this.formDefaults[key];
        } else if (key === 'minROI' || key === 'maxTotalBuyoutPerItem') {
          this.toValueGold[key] = GoldPipe.toCopper(query[key]);
          query[key] = new GoldPipe().transform(this.toValueGold[key]);
        }
      });

    Report.debug('getQuery', query, queryString);
    return query;
  }

  ngOnInit() {
    this.setColumns();
    this.filter();

    this.sm.add(this.auctionService.list,
      () => {
        this.filter();
      });
  }

  private filter(queryParams: any = this.form.getRawValue()) {
    const strings = [];
    const results = [];
    const query = {
      ...queryParams,
      minROI: GoldPipe.toCopper(queryParams.minROI),
      maxTotalBuyoutPerItem: GoldPipe.toCopper(queryParams.maxTotalBuyoutPerItem)
    };

    this.sum.auctionsToBuy = 0;
    this.sum.itemsToBuy = 0;
    this.sum.potentialProfit = 0;
    this.sum.sumCost = 0;

    this.data.length = 0;
    this.tsmShoppingString = '';
    this.rowShoppingString = '';

    this.auctionService.list.value.forEach(ai => {
      if (
        !Filters.isNameMatch(ai.itemID, query.name) ||
        !Filters.isExpansionMatch(ai.itemID, query.expansion, this.realmService.isClassic) ||
        !Filters.isItemClassMatch(ai.itemID, query.itemClass, query.itemSubClass)
      ) {
        return;
      }

      const item: ItemReset = new ItemReset(ai, query.breakPointPercent / 100);
      let matchPoint;
      for (let i = 0, l = item.breakPoints.length; i < l; i++) {
        const bp = item.breakPoints[i];
        if (bp && bp.potentialProfit > 0) {

          if (
            this.isSellTimeMatch(bp, query) &&
            this.isMktPriceThreasholdMatch(bp, query, ai) &&
            this.isMinROIMatch(query, bp) &&
            this.isMinROIPercentMatch(query, bp) &&
            this.isMaxTotalBuyoutPerItemMatch(query, bp) &&
            this.isHigherROIThanPrevious(query, bp, matchPoint) &&
            this.isNewVsCurrentBuyoutPriceLimit(query, bp)
          ) {
            matchPoint = {
              itemID: item.id,
              name: item.name,
              icon: item.icon,
              percentOfMkt: bp.newBuyout / ai.mktPrice,
              regionSaleRate: ai.regionSaleRate,
              avgDailySold: ai.avgDailySold,
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
    return true; // TSM dependent -> Filters.isXSmallerThanOrEqualToY(bp.sellTime, query.timeToSell);
  }

  private isMinROIMatch(query: any, bp) {
    return Filters.isXSmallerThanOrEqualToY(
      query.minROI ? query.minROI : 0,
      bp.potentialProfit);
  }

  private isMktPriceThreasholdMatch(bp, query: any, ai) {
    if (query.mktPriceUpperThreshold === null || !query.mktPriceUpperThreshold) {
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
      query.maxTotalBuyoutPerItem ? query.maxTotalBuyoutPerItem : undefined);
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
    this.itemResetBreakpoint = row;
  }

  resetForm() {
    localStorage.removeItem('query_market_reset');
    this.toValueGold.minROI = GoldPipe.toCopper(this.formDefaults.minROI);
    this.toValueGold.maxTotalBuyoutPerItem = GoldPipe.toCopper(this.formDefaults.maxTotalBuyoutPerItem);
    this.form.reset(this.getQuery());
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
    this.columns.push({key: 'percentOfMkt', title: 'New vs mkt price', dataType: 'percent'});
    this.columns.push({key: 'newVsCurrentBuyoutPercent', title: 'New vs current', dataType: 'percent'});
    this.columns.push({key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'});
    this.columns.push({key: 'sumBuyout', title: 'Total cost', dataType: 'gold'});
    this.columns.push({key: 'potentialValue', title: 'Sum potential value', dataType: 'gold'});
    this.columns.push({key: 'auctionCount', title: '# Auctions', dataType: 'number'});
    this.columns.push({key: 'itemCount', title: '# Item', dataType: 'number'});
    this.columns.push({key: 'breakEvenQuantity', title: 'Break-even #', dataType: 'number'});
    // TSM dependent -> this.columns.push(columnConfig.auction.avgDailySold);
    // TSM dependent -> this.columns.push(columnConfig.auction.regionSaleRate);
    // TSM dependent -> this.columns.push({key: 'sellTime', title: 'Est days to sell', dataType: 'number'});
  }

  setNewInputGoldValue(newValue: any, field: string) {
    const interval = 500;
    this.lastCharacterTyped = +new Date();
    setTimeout(() => {
      if (+new Date() - this.lastCharacterTyped >= interval) {
        this.toValueGold[field] = GoldPipe.toCopper(newValue);
        this.lastCharacterTyped = undefined;
      }
    }, interval);
  }
}
