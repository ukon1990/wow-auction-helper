import {ErrorReport} from '../../../utils/error-report.util';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {SharedService} from '../../../services/shared.service';
import {UserProfitValue} from './user-profit-value.model';

export class UserProfit {
  expired: UserProfitValue = new UserProfitValue('Expired');
  cancelled: UserProfitValue = new UserProfitValue('Cancelled');
  expenses: UserProfitValue = new UserProfitValue('Expenses');
  sales: UserProfitValue = new UserProfitValue('Sales');
  income: UserProfitValue = new UserProfitValue('Income');
  purchases: UserProfitValue = new UserProfitValue('Purchases');
  profit = 0;

  constructor(public daysSince: number, private characters: any) {
  }

  add(value: { amount: number; time: number; price: number; }, type: string): void {
    try {
      const thenVsNow = new Date().getTime() - value.time;
      if (this.isTimeMatch(thenVsNow) && !this.excludeUserCharacters(value)) {
        switch (type) {
          case 'expired':
          case 'cancelled':
            this[type].add(value);
            break;
          case 'expenses':
            this[type].add(value);
            this.profit -= value.amount;
            break;
          case 'income':
            this[type].add(value);
            this.profit += value.amount;
            break;
          case 'sales':
            this[type].add(value);
            this.profit += value.price * value['quantity'];
            break;
          case 'purchases':
            this[type].add(value);
            this.profit -= value.price * value['quantity'];
            break;
        }
      }
    } catch (error) {
      ErrorReport.sendError('UserProfit.add', error);
    }
  }

  private isTimeMatch(thenVsNow) {
    return this.getDaysFromMS(thenVsNow) <= this.daysSince || !this.daysSince;
  }

  excludeUserCharacters(v: any): boolean {
    if (!this.characters) {
      return false;
    }
    return this.characters[v.player] && this.characters[v.otherPlayer];
  }

  getDaysFromMS(ms: number): number {
    const day = 86400000;
    return ms / day;
  }

  setSaleRateForItem(itemId: number, fieldName: string): void {
    const sales = this.sales.itemMap[itemId],
      expired = this.expired.itemMap[itemId],
      cancelled = this.cancelled.itemMap[itemId],
      auctionItem: AuctionItem = SharedService.auctionItemsMap[itemId];
    let total = 0, plus = 0, saleRate = 0;

    if (sales) {
      plus += sales.quantity;
      total += sales.quantity;
    }

    if (expired) {
      total += expired.quantity;
    }

    if (cancelled) {
      total += cancelled.quantity;
    }

    saleRate = plus / (total || 1);

    if (auctionItem) {
      auctionItem[fieldName + 'SaleRate'] = saleRate;
      auctionItem.hasPersonalSaleRate = true;
    }
  }
}
