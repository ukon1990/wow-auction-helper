/*
  The intention with this class
  Is to gather price statistics for the lowest, highest and avg prices
*/
import {Auction} from '../../models/auction/auction';
import {AuctionItemStat} from '../models/auction-item-stat.model';
import {ItemDailyPriceEntry, ItemPriceEntry} from '../../../../client/src/client/modules/item/models/item-price-entry.model';

export class AuctionProcessorUtil {
  static process(auctions: Auction[], lastModified: number, ahId: number): {
    list: AuctionItemStat[];
    hour: number;
  } {
    const start = +new Date();
    const list: AuctionItemStat[] = [], map = {}, hour = new Date(lastModified).getUTCHours();
    if (!auctions) {
      return {
        list: [],
        hour
      };
    }
    const date = new Date(lastModified),
      dateString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    console.log('Date is ' + dateString + ' Hour= ' + hour);
    for (let i = 0, l = auctions.length; i < l; ++i) {
      this.processAuction(map, list, auctions[i], lastModified, ahId, (hour < 10 ? '0' + hour : '' + hour));
    }
    console.log(`Processed ${auctions.length} in ${+new Date() - start} ms`);
    return {
      list,
      hour
    };
  }

  static splitEntries<T>(list: T[]): T[][] {
    const result: T[][] = [];
    list.forEach(entry => {
      let index = (result.length || 1) - 1;
      if (result[index] && result[index].length >= 5000) {
        index++;
      }
      if (!result[index]) {
        result.push([]);
      }
      result[index].push(entry);
    });
    return result;
  }

  private static processAuction(map: any, list: AuctionItemStat[], auction: Auction, lastModified: number, ahId: number, hour: string) {
    const id = AuctionItemStat.bonusId(auction.bonusLists),
      mapId = this.getMapId(auction, id),
      unitPrice = auction.buyout / auction.quantity;
    if (!unitPrice) {
      return;
    }

    if (!map[mapId]) {
      map[mapId] = new AuctionItemStat(ahId, id, auction, lastModified, hour);
      list.push(map[mapId]);
    } else {
      // Add something like avg price variation?
      const item: AuctionItemStat = map[mapId];
      if (item[`price${hour}`] > unitPrice) {
        item[`price${hour}`] = unitPrice;
      }

      item[`quantity${hour}`] += auction.quantity;
    }
  }

  private static getMapId(auction: Auction, id: string) {
    let mapId = auction.item + id;
    if (auction.petSpeciesId) {
      mapId += auction.petSpeciesId;
    }
    return mapId;
  }

  static compilePricesForDay(id: number, row, date: Date, dayOfMonth: string, list: any[]) {
    const result = {
      ahId: id,
      itemId: row.itemId,
      petSpeciesId: row.petSpeciesId,
      bonusIds: row.bonusIds,
      date: `${date.getUTCFullYear()}-${this.getDateNumber(date.getUTCMonth() + 1)}-15`
    };
    for (let i = 0, maxHours = 23; i <= maxHours; i++) {
      date.setUTCHours(i);
      const hour = i < 10 ? '0' + i : '' + i,
        price = row[`price${hour}`],
        quantity = row[`quantity${hour}`];
      if (price) {
        this.handlePriceForDayOfMonth(result, dayOfMonth, price, hour);

        this.handleQuantityForDayOfMonth(result, dayOfMonth, quantity);
      }
    }
    list.push(result);
  }

  static getDateNumber(input: number): string {
    return input < 10 ? '0' + input : '' + input;
  }

  private static handlePriceForDayOfMonth(result: any, dayOfMonth: string, price: number, hour: string) {
    if (!result[`min${dayOfMonth}`] || result[`min${dayOfMonth}`] > price) {
      result[`min${dayOfMonth}`] = price || 0;
      result[`minHour${dayOfMonth}`] = hour || 0;
    }

    if (!result[`max${dayOfMonth}`] || result[`max${dayOfMonth}`] < price) {
      result[`max${dayOfMonth}`] = price || 0;
    }

    if (!result[`avg${dayOfMonth}`]) {
      result[`avg${dayOfMonth}`] = price || 0;
    } else {
      result[`avg${dayOfMonth}`] = (result[`avg${dayOfMonth}`] + price) / 2;
    }
  }

  private static handleQuantityForDayOfMonth(result: any, dayOfMonth: string, quantity) {
    if (!result[`minQuantity${dayOfMonth}`] || result[`minQuantity${dayOfMonth}`] > quantity) {
      result[`minQuantity${dayOfMonth}`] = quantity || 0;
    }

    if (!result[`maxQuantity${dayOfMonth}`] || result[`maxQuantity${dayOfMonth}`] < quantity) {
      result[`maxQuantity${dayOfMonth}`] = quantity || 0;
    }

    if (!result[`avgQuantity${dayOfMonth}`]) {
      result[`avgQuantity${dayOfMonth}`] = quantity || 0;
    } else {
      result[`avgQuantity${dayOfMonth}`] = (result[`avgQuantity${dayOfMonth}`] + quantity) / 2;
    }
  }

  static processHourlyPriceData(result: AuctionItemStat[], callback?: (hour: ItemPriceEntry) => void): ItemPriceEntry[] {
    const list = [];
    result.forEach(entry => {
      for (let i = 0, maxHours = 23; i <= maxHours; i++) {
        const date: Date = new Date(+entry.date);
        date.setUTCHours(i);
        const hour = i < 10 ? '0' + i : i,
          price = entry[`price${hour}`],
          quantity = entry[`quantity${hour}`];
        if (price) {
          const hourEntry: ItemPriceEntry = {
            itemId: entry.itemId,
            timestamp: +date,
            petSpeciesId: entry.petSpeciesId,
            bonusIds: entry.bonusIds,
            min: price,
            quantity: quantity
          };
          if (callback) {
            callback(hourEntry);
          } else {
            list.push(hourEntry);
          }
        }
      }
    });
    return list;
  }

  static processDailyPriceData(result, callback?: (hour: ItemDailyPriceEntry) => void) {
    const list = [];
    result.forEach(entry => {
      for (let i = 1, maxDays = 31; i <= maxDays; i++) {
        const date: Date = new Date(+entry.date);
        date.setUTCDate(i);
        date.setUTCHours(12);
        date.setUTCMinutes(1);
        date.setUTCSeconds(1);
        date.setUTCMilliseconds(1);
        const day = i < 10 ? '0' + i : i,
          min = entry[`min${day}`];
        if (min) {
          const timeEntry: ItemDailyPriceEntry = {
            timestamp: +date,
            itemId: entry.itemId,
            petSpeciesId: entry.petSpeciesId,
            bonusIds: entry.bonusIds,
            min,
            minHour: entry[`minHour${day}`],
            minQuantity: entry[`minQuantity${day}`],
            avg: entry[`avg${day}`],
            avgQuantity: entry[`avgQuantity${day}`],
            max: entry[`max${day}`],
            maxQuantity: entry[`maxQuantity${day}`]
          };

          if (callback) {
            callback(timeEntry);
          } else {
            list.push(timeEntry);
          }
        }
      }
    });
    return list;
  }

  static setCurrentDayFromHourly(result: { daily: any[]; hourly: any[] }) {
    let latestTimestamp;
    const dayMap = {};
    result.daily.forEach(day => {
      if (!latestTimestamp || latestTimestamp < day.timestamp) {
        latestTimestamp = day.timestamp;
      }
    });
    latestTimestamp = new Date(latestTimestamp);
    latestTimestamp.setUTCHours(0);
    latestTimestamp.setUTCMinutes(0);
    latestTimestamp.setUTCSeconds(0);
    latestTimestamp = +latestTimestamp;
    result.hourly.forEach(({timestamp, min, quantity, petSpeciesId, bonusIds}) => {
      if (timestamp > latestTimestamp) {
        const date = new Date(timestamp);
        date.setUTCHours(12);
        date.setUTCMinutes(1);
        date.setUTCSeconds(1);
        date.setUTCMilliseconds(1);
        this.setBaseDayDataForCurrentDayFromHourlyConversion(dayMap, date, petSpeciesId, bonusIds, result);

        const now = dayMap[date.toDateString()];
        this.setMinValuesFromHourlyToDailyConversion(now, min, timestamp, quantity);
        this.setMaxValuesFromHourlyToDailyConversion(now, min, quantity);
        this.setAvgValuesFromHourlyToDailyConversion(now, min, quantity);
      }
    });
  }

  private static setAvgValuesFromHourlyToDailyConversion(now, min, quantity) {
    if (!now.avg) {
      now.avg = min;
    } else {
      now.avg = (now.avg + min) / 2;
    }

    if (!now.avgQuantity) {
      now.avgQuantity = quantity;
    } else {
      now.avgQuantity = (now.avgQuantity + quantity) / 2;
    }
  }

  private static setMaxValuesFromHourlyToDailyConversion(now, min, quantity) {
    if (!now.max || now.max < min) {
      now.max = min;
    }

    if (!now.maxQuantity || now.maxQuantity < quantity) {
      now.maxQuantity = quantity;
    }
  }

  private static setMinValuesFromHourlyToDailyConversion(now, min, timestamp, quantity) {
    if (!now.min || now.min > min) {
      now.min = min;
      now.minHour = new Date(timestamp).getUTCHours();
    }

    if (!now.minQuantity || now.minQuantity > quantity) {
      now.minQuantity = quantity;
    }
  }

  private static setBaseDayDataForCurrentDayFromHourlyConversion(dayMap: {}, date: Date,
                                                                 petSpeciesId, bonusIds, result: { daily: any[]; hourly: any[] }) {
    if (!dayMap[date.toDateString()]) {
      dayMap[date.toDateString()] = {
        timestamp: +date,
        petSpeciesId: petSpeciesId,
        bonusIds: bonusIds,
        min: undefined,
        minHour: undefined,
        minQuantity: undefined,
        avg: undefined,
        avgQuantity: undefined,
        max: undefined,
        maxQuantity: undefined
      };
      result.daily.push(dayMap[date.toDateString()]);
    }
  }

  static getDailyColumnsSince(daysSince: number, currentDate = new Date(), includeAllKeys = false) {
    const DAY = 1000 * 60 * 60 * 24;
    const startDate = new Date(+currentDate - DAY * daysSince);
    const columns: string[] = []; // avg01, avgQuantity01
    const columnMap = new Map<string, string>();
    const months: string[] = []; // '2020-12-15' OR date = '2020-12-15'
    const monthMap = new Map<string, string>();

    for (let i = 0; i < daysSince; i++) {
      const date = new Date(+startDate + DAY * i),
        day = date.getUTCDate(),
        dayString = (day < 10 ? '0' : '') + day,
        monthString = `'${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-15'`;
      let columnSet = `min${dayString}, avg${dayString}, avgQuantity${dayString}`;

      if (includeAllKeys) {
        columnSet += `,max${dayString}, minHour${dayString}, minQuantity${dayString}, maxQuantity${dayString}`;
      }

      if (!columnMap.has(columnSet)) {
        columns.push(columnSet);
        columnMap.set(columnSet, columnSet);
      }

      if (!monthMap.has(monthString)) {
        months.push(monthString);
        monthMap.set(monthString, monthString);
      }
    }

    return {
      columns,
      months
    };
  }

  static getHourlyColumnsSince(currentDate = new Date()) {
    const HOUR = 1000 * 60 * 60;
    const startDate = new Date(+currentDate - HOUR * 25);
    const dates: {date: string, columns: string[]}[] = []; // avg01, avgQuantity01
    const monthMap = new Map<string, {date: string, columns: string[]}>();

    for (let i = 0; i <= 24; i++) {
      const date = new Date(+startDate + HOUR * i),
        hour = date.getUTCHours(),
        hourString = (hour < 10 ? '0' : '') + hour,
        monthString = `'${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}'`;
      const columnSet = `price${hourString}, quantity${hourString}`;

      if (!monthMap.has(monthString)) {
        const val = {date: monthString, columns: []};
        monthMap.set(monthString, val);
        dates.push(val);
      }
      monthMap.get(monthString).columns.push(columnSet);
    }

    return dates;
  }
}
