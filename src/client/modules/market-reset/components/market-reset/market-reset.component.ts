import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {SharedService} from '../../../../services/shared.service';
import {ColumnDescription} from '../../../table/models/column-description';
import {MarketResetCost} from '../../../auction/models/market-reset-cost.model';
import {Filters} from '../../../../utils/filtering';
import {Crafting} from '../../../crafting/models/crafting';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Auction} from '../../../auction/models/auction.model';
import {Report} from '../../../../utils/report.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {ItemReset} from '../../models/item-reset.model';
import {ItemResetBreakpoint} from '../../models/item-reset-breakpoint.model';

@Component({
  selector: 'wah-market-reset',
  templateUrl: './market-reset.component.html',
  styleUrls: ['./market-reset.component.scss']
})
export class MarketResetComponent implements OnInit {
  form: FormGroup;
  data = [];
  sm = new SubscriptionManager();
  tsmShoppingString = '';
  pipe = new GoldPipe();
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'potentialProfitPercent', title: 'ROI %', dataType: 'percent'},
    {key: 'potentialProfit', title: 'Profit', dataType: 'gold'},
    {key: 'newBuyout', title: 'New buyout', dataType: 'gold'},
    {key: 'avgBuyout', title: 'Avg cost/item', dataType: 'gold'},
    {key: 'sumBuyout', title: 'Total cost', dataType: 'gold'},
    {key: 'sellTime', title: 'Sell time(maybe)', dataType: 'number'},
  ];

  sum = {
    sumCost: 0,
    potentialProfit: 0,
    itemsToBuy: 0,
    auctionsToBuy: 0
  };
  rowShoppingString = '';

  constructor(private formBuilder: FormBuilder, private service: AuctionsService) {
    const query = localStorage['query_market_reset'] ?
      JSON.parse(localStorage['query_market_reset']) : undefined;
    this.form = this.formBuilder.group({
      name: new FormControl(query.name),
      timeToSell: new FormControl(query.timeToSell),
      breakPointPercent: new FormControl(query.breakPointPercent || 110),
      mktPriceUpperThreshold: new FormControl(query.mktPriceUpperThreshold),
      minROI: new FormControl(query.minROI),
      minROIPercent: new FormControl(query.minROIPercent),
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

  hasDefinedAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
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
      for (let i = 0, l = item.breakPoints.length; i < l; i++) {
        const bp = item.breakPoints[i];
        if (Filters.isXSmallerThanY(bp.sellTime, query.timeToSell)) {
          if (bp && bp.potentialProfit > 0) {
            this.data.push({
              itemID: item.id,
              name: item.name,
              icon: item.icon,
              ...bp
            });

            this.sum.auctionsToBuy += bp.auctionCount;
            this.sum.itemsToBuy += bp.itemCount;
            this.sum.potentialProfit += bp.potentialProfit;
            this.sum.sumCost += bp.sumBuyout;

            strings.push(bp.tsmShoppingString);

            return;
          }
        }
      }
    });
    this.tsmShoppingString = strings.join(';');
  }

  setRoShoppingString(row: ItemResetBreakpoint): void {
    this.rowShoppingString = row.tsmShoppingString;
  }
}
