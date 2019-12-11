import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {AuctionsService} from '../../../../services/auctions.service';
import {Report} from '../../../../utils/report.util';
import {SharedService} from '../../../../services/shared.service';
import {TSMCSV, TsmLuaUtil} from '../../../../utils/tsm/tsm-lua.util';

@Component({
  selector: 'wah-resell-history',
  templateUrl: './resell-history.component.html',
  styleUrls: ['./resell-history.component.scss']
})
export class ResellHistoryComponent implements OnInit, OnDestroy {
  list: any[];
  map = {};
  sm = new SubscriptionManager();

  table = {
    columns: [
      {key: 'name', title: 'Item', dataType: 'name'},
      {key: 'sumSpent', title: 'Sum spent', dataType: 'gold'},
      {key: 'purchasedQuantity', title: '# Bought', dataType: 'number'},
      {key: 'sumSold', title: 'Sum sold', dataType: 'gold'},
      {key: 'soldQuantity', title: '# Sold', dataType: 'number'},
      {key: 'avgBuyPrice', title: 'Avg buy price', dataType: 'gold'},
      {key: 'avgSalePrice', title: 'Avg sale price', dataType: 'gold'},
      {key: 'avgProfit', title: 'Avg profit', dataType: 'gold'},
      {key: 'sumProfit', title: 'Sum profit', dataType: 'gold'}
    ],
    data: []
  };

  constructor(private auctionsService: AuctionsService) {
    /*
      TODO: Split into months with a rest of bought per sold
      And only calculate based on bought that exists in sold etc
     */
    this.sm.add(TsmLuaUtil.events, (data: TSMCSV) => {
      if (!data) {
        return;
      }
      Report.debug('ResellHistoryComponent', data);
      Object.keys(data.csvBuys).forEach(realm => {
        if (!this.map[realm]) {
          this.map[realm] = {};
        }
        data.csvBuys[realm]
          .forEach(({id, quantity, price, stackSize}) => {
            if (!this.map[realm][id]) {
              this.map[realm][id] = {
                id,
                name: SharedService.items[id] ? SharedService.items[id].name : 'Not in DB',
                purchasedQuantity: quantity,
                soldQuantity: 0,
                sumSpent: price * quantity,
                sumSold: 0,
                stackSize
              };
            } else {
              this.map[realm][id].purchasedQuantity += quantity;
              this.map[realm][id].sumSpent += quantity * price;
            }
          });

        data.csvSales[realm]
          .forEach(({id, quantity, price, stackSize}) => {
            if (this.map[realm][id]) {
              this.map[realm][id].soldQuantity += quantity;
              this.map[realm][id].sumSold += quantity * price;
            }
          });
      });

      this.populateTableForRealm();

      console.log('Result', this.map);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private populateTableForRealm(realm: string = 'Draenor') {
    const list = [];
    Object.keys(this.map[realm]).forEach(id => {
      const item = this.map[realm][id];
      if (item.purchasedQuantity / item.soldQuantity > 0.6) {
        return;
      }
      item.avgBuyPrice = item.sumSpent / item.purchasedQuantity;
      item.avgSalePrice = item.sumSold / item.soldQuantity;
      item.sumProfit = (item.avgSalePrice * item.purchasedQuantity) - (item.avgBuyPrice * item.purchasedQuantity);
      item.avgProfit = item.avgSalePrice - item.avgBuyPrice;
      list.push(item);
    });
    this.table.data = list;
  }
}
