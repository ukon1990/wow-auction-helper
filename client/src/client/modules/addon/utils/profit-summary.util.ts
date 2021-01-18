import {CSVExpiredAndCancelled, CSVIncomeAndExpense, CSVSaleAndBuys} from './../../../utils/tsm/tsm-lua.util';
import {TSMCSV} from '../../../utils/tsm/tsm-lua.util';
import {TimeUtil} from '../../../../../../api/src/auction/utils/time.util';
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

    const addEntryIfMissing = (id: number, name: string) => {
      let entry: ItemSaleHistory;
      if (!map.has(id)) {
        entry = {
          itemId: id,
          bonusIds: [],
          name,

          cancelled: 0,
          expired: 0,

          minSalePrice: 0,
          avgSalePrice: 0,
          maxSalePrice: 0,
          sumSalePrice: 0,
          soldQuantity: 0,

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
    };

    sales.forEach(sale => {
      if (sale.source !== 'Auction') {
        return;
      }
      const entry: ItemSaleHistory = addEntryIfMissing(sale.id, sale.name);
      if (!entry.minSalePrice || entry.minSalePrice > sale.price) {
        entry.minSalePrice = sale.price;
      }

      if (!entry.maxSalePrice || entry.maxSalePrice < sale.price) {
        entry.maxSalePrice = sale.price;
      }


      if (!entry.avgSalePrice) {
        entry.avgSalePrice = sale.price;
      } else {
        entry.avgSalePrice = (sale.price + entry.avgSalePrice) / 2;
      }

      entry.sumSalePrice += sale.price * sale.quantity;
      entry.soldQuantity += sale.quantity;
      sumIncome += sale.price * sale.quantity;
    });

    purcheses.forEach(bought => {
      if (bought.source !== 'Auction') {
        return;
      }
      const entry: ItemSaleHistory = addEntryIfMissing(bought.id, bought.name);
      if (!entry.minBuyPrice || entry.minBuyPrice > bought.price) {
        entry.minBuyPrice = bought.price;
      }


      if (!entry.maxBuyPrice || entry.maxBuyPrice < bought.price) {
        entry.maxBuyPrice = bought.price;
      }


      if (!entry.avgBuyPrice) {
        entry.avgBuyPrice = bought.price;
      } else {
        entry.avgBuyPrice = (bought.price + entry.avgBuyPrice) / 2;
      }


      entry.sumBuyPrice += bought.price * bought.quantity;
      entry.boughtQuantity += bought.quantity;
      sumCost += bought.price * bought.quantity;
    });

    return {
      list,
      sumCost,
      sumIncome,
      sumProfit: sumIncome - sumCost,
    };
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
