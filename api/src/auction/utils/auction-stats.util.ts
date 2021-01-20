import {ItemStats, Stat} from '../models/item-stats.model';
import {AuctionProcessorUtil} from './auction-processor.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';
import {ItemDailyPriceEntry, ItemPriceEntry} from '../../../../client/src/client/modules/item/models/item-price-entry.model';
import {DateUtil} from '@ukon1990/js-utilities';

export class AuctionStatsUtil {

  static getId(id: number, bonusIds: any, petSpeciesId: any): string {
    return `${id}-${bonusIds}-${petSpeciesId}`;
  }

  static processHours(rows: ItemPriceEntry[]): ItemStats[] {
    const map = new Map<string, ItemPriceEntry[]>(),
      list: ItemPriceEntry[][] = [];
    const processedDBEntryCallback = (hour: ItemPriceEntry) => {
      const id = this.getId(hour.itemId, hour.bonusIds, hour.petSpeciesId);
      if (!map.has(id)) {
        const entry: ItemPriceEntry[] = [];
        map.set(id, entry);
        list.push(entry);
      }
      map.get(id).push(hour);
    };
    let start = +new Date();
    /*
    AuctionProcessorUtil.processHourlyPriceData(rows,
      (hour: ItemPriceEntry) => processedDBEntryCallback(hour));
     */
    rows.forEach(row => processedDBEntryCallback(row));
    console.log(`processHourlyPriceData took ${+new Date() - start} ms`);
    start = +new Date();
    const result = list.map(item => this.processDaysForHourlyPriceData(item, false, true));
    console.log(`processDaysForHourlyPriceData took ${+new Date() - start} ms`);
    return result;
  }

  static processDays(rows: ItemDailyPriceEntry[]): ItemStats[] {
    const map = new Map<string, ItemDailyPriceEntry[]>(),
      list: ItemDailyPriceEntry[][] = [];
    const processedDBEntryCallback = (hour: ItemDailyPriceEntry) => {
      const id = this.getId(hour.itemId, hour.bonusIds, hour.petSpeciesId);
      if (!map.has(id)) {
        const entry: ItemDailyPriceEntry[] = [];
        map.set(id, entry);
        list.push(entry);
      }
      map.get(id).push(hour);
    };
    let start = +new Date();
    rows.forEach((hour: ItemDailyPriceEntry) => processedDBEntryCallback(hour));
    console.log(`processHourlyPriceData took ${+new Date() - start} ms`);
    start = +new Date();
    const result = list.map(item =>
      this.processDaysForDailyPriceData(item, false, true));
    console.log(`processDaysForHourlyPriceData took ${+new Date() - start} ms`);
    return result;
  }

  static processDaysForHourlyPriceData(hours: ItemPriceEntry[], isSortedAsc: boolean = false, isMinimal: boolean = false): ItemStats {
    const itemStats = this.getBaseItemStatItem(hours, isMinimal),
      result = this.getBaseItemStatItem(hours, isMinimal);
    (isSortedAsc ?
        hours :
        hours.sort((a, b) => a.timestamp - b.timestamp)
    ).forEach((hour: ItemPriceEntry, index: number, array: ItemPriceEntry[]) => {
      if (index === 0) {
        return;
      }
      const daysSince: number = DateUtil.timeSince(hour.timestamp, 'd'),
        hoursSince: number = DateUtil.timeSince(hour.timestamp, 'h');
      /*
        Doing it this way, to hopefully save a couple MS in compute in AWS Lambda,
        if I end up calculating this for whole realms of multiple items at a time.
       */
      if (daysSince <= 14) {
        const priceDiff = hour.min - array[index - 1].min,
          quantityDiff = hour.quantity - array[index - 1].quantity;

        if (!isMinimal) {
          itemStats.past14Days = this.getEntryValues(itemStats.past14Days, hour.min, hour.quantity, priceDiff, quantityDiff);
        }

        if (daysSince <= 7) {
          itemStats.past7Days = this.getEntryValues(itemStats.past7Days, hour.min, hour.quantity, priceDiff, quantityDiff);

          if (daysSince <= 1) {
            itemStats.past24Hours = this.getEntryValues(itemStats.past24Hours, hour.min, hour.quantity, priceDiff, quantityDiff);

            if (hoursSince <= 12 && !isMinimal) {
              itemStats.past12Hours = this.getEntryValues(itemStats.past12Hours, hour.min, hour.quantity, priceDiff, quantityDiff);
            }
          }
        }
      }
    });
    this.setResultForPeriod(result.past24Hours, itemStats.past24Hours);
    if (!isMinimal) {
      this.setResultForPeriod(result.past7Days, itemStats.past7Days);
      this.setResultForPeriod(result.past14Days, itemStats.past14Days);
      this.setResultForPeriod(result.past12Hours, itemStats.past12Hours);
    }
    return result;
  }

  static processDaysForDailyPriceData(days: ItemDailyPriceEntry[], isSortedAsc: boolean = false, isMinimal: boolean = false): ItemStats {
    const itemStats = this.getBaseItemStatItem(days, isMinimal),
      result = this.getBaseItemStatItem(days, isMinimal);
    (isSortedAsc ?
        days :
        days.sort((a, b) => a.timestamp - b.timestamp)
    ).forEach((day: ItemDailyPriceEntry, index: number, array: ItemDailyPriceEntry[]) => {
      if (index === 0) {
        return;
      }
      const daysSince: number = DateUtil.timeSince(day.timestamp, 'd');
      /*
        Doing it this way, to hopefully save a couple MS in compute in AWS Lambda,
        if I end up calculating this for whole realms of multiple items at a time.
       */
      if (daysSince <= 180) {
        const priceDiff = day.avg - array[index - 1].avg,
          quantityDiff = day.avgQuantity - array[index - 1].avgQuantity;

        if (!isMinimal) {
          itemStats.past180Days = this.getEntryValues(itemStats.past180Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
        }
        if (daysSince <= 90) {
          if (!isMinimal) {
            itemStats.past90Days = this.getEntryValues(itemStats.past90Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
          }
          if (daysSince <= 60) {
            if (!isMinimal) {
              itemStats.past60Days = this.getEntryValues(itemStats.past60Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
            }
            if (daysSince <= 30) {
              if (!isMinimal) {
                itemStats.past30Days = this.getEntryValues(itemStats.past30Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
              }

              if (daysSince <= 14) {
                if (!isMinimal) {
                  itemStats.past14Days = this.getEntryValues(itemStats.past14Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
                }

                if (daysSince <= 7) {
                  itemStats.past7Days = this.getEntryValues(itemStats.past7Days, day.avg, day.avgQuantity, priceDiff, quantityDiff);
                }
              }
            }
          }
        }
      }
    });
    this.setResultForPeriod(result.past7Days, itemStats.past7Days);
    if (!isMinimal) {
      this.setResultForPeriod(result.past14Days, itemStats.past14Days);
      this.setResultForPeriod(result.past30Days, itemStats.past30Days);
      this.setResultForPeriod(result.past90Days, itemStats.past90Days);
      this.setResultForPeriod(result.past180Days, itemStats.past180Days);
    }
    return result;
  }

  private static setResultForPeriod(result: Stat, sums: Stat) {
    const twoDecimals = (number: number) => Math.round((number + Number.EPSILON) * 100) / 100;
    result.quantity.trend = twoDecimals(sums.quantity.trend / sums.totalEntries);
    result.quantity.avg = twoDecimals(sums.quantity.avg / sums.totalEntries);
    result.price.trend = twoDecimals(sums.price.trend / sums.totalEntries);
    result.price.avg = twoDecimals(sums.price.avg / sums.totalEntries);
    delete result.totalEntries;
  }

  private static getBaseItemStatItem(hours: ItemPriceEntry[] | ItemDailyPriceEntry[], isMinimal: boolean): ItemStats {
    const statPart = {
      trend: 0,
      avg: 0,
    }, vals: ItemStats = {
      itemId: hours[0].itemId,
      past7Days: {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      },
      past24Hours: {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      },
    };

    if (!isMinimal) {
      vals.past12Hours = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
      vals.past14Days = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
      vals.past30Days = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
      vals.past60Days = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
      vals.past90Days = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
      vals.past180Days = {
        price: {
          ...statPart,
        },
        quantity: {
          ...statPart,
        },
        totalEntries: 0,
      };
    }

    if (hours[0].petSpeciesId) {
      vals.petSpeciesId = hours[0].petSpeciesId;
    }
    if (hours[0].bonusIds) {
      vals.bonusIds = hours[0].bonusIds;
    }
    return vals;
  }

  private static getEntryValues(entry: Stat, price, quantity, priceDiff: number, quantityDiff: number): Stat {
    const {price: trendPrice, quantity: trendQuantity, totalEntries} = {...entry};
    return {
      price: {
        trend: priceDiff + trendPrice.trend,
        avg: price + trendPrice.avg,
      },
      quantity: {
        trend: quantityDiff + trendQuantity.trend,
        avg: quantity + trendQuantity.avg,
      },
      totalEntries: totalEntries + 1,
    };
  }
}
