import {CSVExpiredAndCancelled, CSVIncomeAndExpense, CSVSaleAndBuys, GoldLogEntry} from '../../../utils/tsm/tsm-lua.util';
import {TSMCSV} from '../../../utils/tsm/tsm-lua.util';
import {DateUtil} from '@ukon1990/js-utilities';

interface ItemHistory {
  time: number;
  buyPrice: number;
  buyQuantity: number;
  salePrice: number;
  saleQuantity: number;
}

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

  history: ItemHistory[];
  historyMap: Map<number, ItemHistory>;
}

export interface ItemSaleHistorySummary {
  list: ItemSaleHistory[];
  goldLog: number[][];
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
    purchases: CSVSaleAndBuys[],
    expired: CSVExpiredAndCancelled[],
    cancelled: CSVExpiredAndCancelled[],
    goldLog: GoldLogEntry[]
  ): ItemSaleHistorySummary {
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
      this.addOrUpdateItemHistoryEntry(entry, sale, true);
    });

    purchases.forEach(bought => {
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
      this.addOrUpdateItemHistoryEntry(entry, bought);
    });

    [...expired, ...cancelled].forEach(({id, bonusIds, name, quantity}) => {
      const entry = addEntryIfMissing(id, bonusIds, name);
      entry.cancelledAndExpiredQuantity += quantity;
    });

    list.forEach(row => {
      const saleRate = row.soldQuantity / (row.cancelledAndExpiredQuantity + row.soldQuantity);
      const hasBuyAndSalePrice = row.avgSalePrice && row.avgBuyPrice;
      row.saleRate = saleRate || 0;
      row.diff = hasBuyAndSalePrice ? row.avgSalePrice - row.avgBuyPrice : 0;
      row.diffPercent = hasBuyAndSalePrice ? row.avgSalePrice / row.avgBuyPrice : 0;
    });

    return {
      avgPerDay: 0,
      dailyStats: [],
      goldLog: this.getGoldHistory(goldLog),
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
        history: [],
        historyMap: new Map<number, ItemHistory>(),
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

    const expenses: CSVIncomeAndExpense[] = (csvData.csvExpense[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const income: CSVIncomeAndExpense[] = (csvData.csvIncome[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const sales: CSVSaleAndBuys[] = (csvData.csvSales[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const purcheses: CSVSaleAndBuys[] = (csvData.csvBuys[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const expired: CSVExpiredAndCancelled[] = (csvData.csvExpired[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));
    const cancelled: CSVExpiredAndCancelled[] = (csvData.csvCancelled[realm] || []).filter(({time}) =>
      this.isWithinTimeLimit(time, startDate, endDate));

    const result: ItemSaleHistorySummary = this.processData(
      expenses, income,
      sales, purcheses,
      expired, cancelled,
      csvData.goldLog[realm] ?
        (csvData.goldLog[realm].All || []) : [],
    );

    result.avgPerDay = result.sumProfit / DateUtil.getDifferenceInDays(startDate, endDate);

    return {
      ...result,
      goldLog: result.goldLog.filter(([minute]) => this.isWithinTimeLimit(minute, startDate, endDate))
    };
  }

  private addOrUpdateItemHistoryEntry(entry: ItemSaleHistory, sale: CSVSaleAndBuys, isSale?: boolean) {
    // Getting the start of the selected day for the user
    const time = +this.getStartOfDayForDate(sale.time);
    // Grouping the history entries per day
    let history = entry.historyMap.get(time);
    if (!history) {
      const newHistory: ItemHistory = {
        time,
        buyPrice: 0,
        buyQuantity: 0,
        salePrice: 0,
        saleQuantity: 0,
      };
      entry.historyMap.set(time, newHistory);
      entry.history.push(newHistory);
      history = newHistory;
    }

    if (isSale) {
      history.saleQuantity += sale.quantity;
      history.salePrice += sale.price;
    } else {
      history.buyQuantity += sale.quantity;
      history.buyPrice += sale.price;
    }
  }

  private getGoldHistory(log: GoldLogEntry[]) {
    const sortedLog: GoldLogEntry[] = log.sort((a, b) => a[0] - b[0]);
    const charMap = new Map<string, Map<number, GoldLogEntry>>();
    const dateMap = new Map<number, any>();
    const dateList: number[] = [];
    const goldLog: number[][] = [];
    const map: Map<number, number[]> = new Map<number, number[]>();
    sortedLog.forEach(entry => {
      let character = charMap.get(entry.character);
      if (!character) {
        character = new Map<number, GoldLogEntry>();
        charMap.set(entry.character, character);
      }
      const time = this.getStartOfDayForDate(entry.minute);
      character.set(+time, {
        ...entry,
        minute: +time,
      });
      if (!dateMap.has(+time)) {
        dateMap.set(+time, +time);
        dateList.push(+time);
      }
    });

    charMap.forEach(character => {
      const history = [];
      dateList.forEach((minute: number, index) => {
        let entry = character.get(minute);
        if (!character.has(minute)) {
          const previous = history[history.length - 1];
          entry = previous ? {
            ...previous,
            copper: previous.copper,
            minute
          } : {minute, copper: 0};
        }

        const time = entry.minute;
        let value = map.get(+time);
        if (!value) {
          const newValue = [+time, 0];
          map.set(+time, newValue);
          goldLog.push(newValue);
          value = newValue;
        }
        value[1] += entry.copper;
        history.push(entry);
      });
    });
    return goldLog.sort((a, b) => a[0] - b[0]);
  }

  private getStartOfDayForDate(input: number): number {
    const time = new Date(input);
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    return +time;
  }
}
