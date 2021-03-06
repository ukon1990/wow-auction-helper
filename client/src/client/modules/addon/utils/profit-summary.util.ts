import {CSVExpiredAndCancelled, CSVIncomeAndExpense, CSVSaleAndBuys} from './../../../utils/tsm/tsm-lua.util';
import {TSMCSV} from '../../../utils/tsm/tsm-lua.util';
import {DateUtil} from '@ukon1990/js-utilities';

export interface ItemSaleHistory {
  itemId: number;
  name: string;
  bonusIds: number[];

  cancelled: number;
  expired: number;

  minSalePrice: number;
  avgSalePrice: number;
  maxSalePrice: number;
  sumSalePrice: number;
  soldQuantity: number;
  cancelledAndExpiredQuantity: number;
  saleRate: number;

  minBuyPrice: number;
  avgBuyPrice: number;
  maxBuyPrice: number;
  sumBuyPrice: number;
  boughtQuantity: number;

  diff: number;
  diffPercent: number;

}

export interface ItemSaleHistorySummary {
  list: ItemSaleHistory[];
  dailyStats: any[];
  sumCost: number;
  sumIncome: number;
  sumProfit: number;
  avgPerDay?: number;
}

type AddIfMissing = (id: number, bonusIds: number[], name: string) => ItemSaleHistory;

export class ProfitSummaryUtil {
  private isWithinTimeLimit(time: number, start: Date, end: Date): boolean {
    return !(time < +start || time > +end);
  }

  processData(
    expenses: CSVIncomeAndExpense[],
    income: CSVIncomeAndExpense[],
    sales: CSVSaleAndBuys[],
    purcheses: CSVSaleAndBuys[],
    expired: CSVExpiredAndCancelled[],
    cancelled: CSVExpiredAndCancelled[]): ItemSaleHistorySummary {
    const map: Map<number, ItemSaleHistory> = new Map<number, ItemSaleHistory>();
    const list: ItemSaleHistory[] = [];
    let sumCost = 0;
    let sumIncome = 0;

    const addEntryIfMissing = (id: number, bonusIds: number[], name: string) => {
      return this.addEntryIfMissing(map, id, bonusIds, name, list);
    };

    sales.forEach(sale => {
      if (sale.source !== 'Auction') {
        return;
      }
      const entry: ItemSaleHistory = this.addEntryIfMissing(map, sale.id, sale.bonusIds, sale.name, list);

      entry.minSalePrice = this.getMinPrice(entry.minSalePrice, sale.price);
      entry.maxSalePrice = this.getMaxPrice(entry.maxSalePrice, sale.price);
      entry.avgSalePrice = this.getAvgPrice(entry.avgSalePrice, sale.price);

      entry.sumSalePrice += sale.price * sale.quantity;
      entry.soldQuantity += sale.quantity;
      sumIncome += sale.price * sale.quantity;
    });

    purcheses.forEach(bought => {
      if (bought.source !== 'Auction') {
        return;
      }
      const entry: ItemSaleHistory = this.addEntryIfMissing(map, bought.id, bought.bonusIds, bought.name, list);
      entry.minBuyPrice = this.getMinPrice(entry.minBuyPrice, bought.price);
      entry.maxBuyPrice = this.getMaxPrice(entry.maxBuyPrice, bought.price);
      entry.avgBuyPrice = this.getAvgPrice(entry.avgBuyPrice, bought.price);

      entry.sumBuyPrice += bought.price * bought.quantity;
      entry.boughtQuantity += bought.quantity;
      sumCost += bought.price * bought.quantity;
    });

    [...expired, ...cancelled].forEach(({id, bonusIds, name, quantity}) => {
      const entry = addEntryIfMissing(id, bonusIds, name);
      entry.cancelledAndExpiredQuantity += quantity;
    });

    list.forEach(row => {
      row.saleRate = row.soldQuantity / (row.cancelledAndExpiredQuantity + row.soldQuantity);
    });

    return {
      avgPerDay: 0,
      dailyStats: [],
      list,
      sumCost,
      sumIncome,
      sumProfit: sumIncome - sumCost
    };
  }

  private getMinPrice(minPrice: number, price: number): number {
    if (!minPrice || minPrice > price) {
      return price;
    }
    return minPrice;
  }

  private getMaxPrice(maxPrice: number, price: number): number {
    if (!maxPrice || maxPrice < price) {
      return price;
    }
    return maxPrice;
  }

  private getAvgPrice(avgPrice: number, price: number): number {
    if (!avgPrice) {
      return price;
    } else {
      return (price + avgPrice) / 2;
    }
  }

  private addEntryIfMissing(map: Map<number, ItemSaleHistory>, id: number, bonusIds: number[], name: string, list: ItemSaleHistory[]) {
    let entry: ItemSaleHistory;
    if (!map.has(id)) {
      entry = {
        itemId: id,
        bonusIds,
        name,

        cancelled: 0,
        expired: 0,

        minSalePrice: 0,
        avgSalePrice: 0,
        maxSalePrice: 0,
        sumSalePrice: 0,
        soldQuantity: 0,
        cancelledAndExpiredQuantity: 0,
        saleRate: 0,

        minBuyPrice: 0,
        avgBuyPrice: 0,
        maxBuyPrice: 0,
        sumBuyPrice: 0,
        boughtQuantity: 0,

        diff: 0,
        diffPercent: 0,
      };
      map.set(id, entry);
      list.push(entry);
    } else {
      entry = map.get(id);
    }
    return entry;
  }

  /**
   * Reducing the tsm data to a mapped dataset for the defined period
   * @param csvData
   * @param realm
   * @param startDate
   * @param endDate
   */
  calculate(csvData: TSMCSV, realm: string, startDate: Date, endDate: Date): ItemSaleHistorySummary {
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(999);

    const expenses: CSVIncomeAndExpense[] = csvData.csvExpense[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const income: CSVIncomeAndExpense[] = csvData.csvIncome[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const sales: CSVSaleAndBuys[] = csvData.csvSales[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const purcheses: CSVSaleAndBuys[] = csvData.csvBuys[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const expired: CSVExpiredAndCancelled[] = csvData.csvExpired[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const cancelled: CSVExpiredAndCancelled[] = csvData.csvCancelled[realm].filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const result: ItemSaleHistorySummary = this.processData(
      expenses, income,
      sales, purcheses,
      expired, cancelled
    );

    result.avgPerDay = result.sumProfit / DateUtil.getDifferenceInDays(startDate, endDate);

    return result;
  }
}
