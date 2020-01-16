import {ErrorReport} from '../../../utils/error-report.util';

export class UserProfitValue {
  quantity = 0;
  copper = 0;
  itemMap = {};
  items = [];

  constructor(public category: string) {
  }

  add(value): void {
    try {
      if (value.quantity) {
        this.quantity += value.quantity;
        this.copper += this.getCopperValue(value) * value.quantity;
        this.addItem(value);
      } else {
        this.quantity++;
        this.copper += this.getCopperValue(value);
      }
    } catch (error) {
      ErrorReport.sendError('UserProfitValue.add', error);
    }
  }

  private addItem(value): void {
    try {
      let i = this.itemMap[value.id];
      if (!i) {
        this.itemMap[value.id] = {
          id: value.id,
          name: value.name,
          quantity: 0,
          totalPrice: 0,
          maxPrice: 0,
          minPrice: 0,
          avgPrice: 0,
          category: this.category,
          history: []
        };
        i = this.itemMap[value.id];
      }
      if (value.quantity) {
        i.quantity += value.quantity;
      } else {
        i.quantity++;
      }
      i.history.push({
        buyout: this.getCopperValue(value),
        quantity: value.quantity,
        timestamp: value.time
      });

      if (this.getCopperValue(value) > i.maxPrice) {
        i.maxPrice = this.getCopperValue(value);
      }

      if (i.minPrice === 0 || this.getCopperValue(value) < i.minPrice) {
        i.minPrice = this.getCopperValue(value);
      }

      i.totalPrice += this.getCopperValue(value) * (value.quantity || 1);
      i.avgPrice = i.totalPrice / i.quantity;
    } catch (error) {
      ErrorReport.sendError('UserProfitValue.addItem', error);
    }
  }

  setAndSortItemList(): void {
    try {
      Object.keys(this.itemMap)
        .forEach(id =>
          this.items.push(this.itemMap[id]));

      this.items.sort((a, b) =>
        b.totalPrice - a.totalPrice);
    } catch (error) {
      ErrorReport.sendError('UserProfitValue.setAndSortItemList', error);
    }
  }

  private getCopperValue(value) {
    return value.amount || value.price || 0;
  }
}
