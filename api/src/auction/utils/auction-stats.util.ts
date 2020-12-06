import {ItemStats, Stat} from '../models/item-stats.model';
import {AuctionProcessorUtil} from './auction-processor.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';
import {ItemPriceEntry} from '../../../../client/src/client/modules/item/models/item-price-entry.model';
import {DateUtil} from '@ukon1990/js-utilities';

export class AuctionStatsUtil {
  static processDays(rows: AuctionItemStat[]): ItemStats[] {
    const map = new Map<string, ItemPriceEntry[]>(),
      list: ItemPriceEntry[][] = [];
    const processedDBEntryCallback = (hour: ItemPriceEntry) => {
      const id = `${hour.itemId}-${hour.bonusIds}-${hour.petSpeciesId}`;
      if (!map.has(id)) {
        const entry: ItemPriceEntry[] = [];
        map.set(id, entry);
        list.push(entry);
      }
      map.get(id).push(hour);
    };
    let start = +new Date();
    AuctionProcessorUtil.processHourlyPriceData(rows,
      (hour: ItemPriceEntry) => processedDBEntryCallback(hour));
    console.log(`processHourlyPriceData took ${+new Date() - start} ms`);
    start = +new Date();
    const result = list.map(item => this.processDaysForHourlyPriceData(item, true, true));
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
      const priceDiff = hour.min - array[index - 1].min,
        quantityDiff = hour.quantity - array[index - 1].quantity,
        daysSince: number = DateUtil.timeSince(hour.timestamp, 'd'),
        hoursSince: number = DateUtil.timeSince(hour.timestamp, 'h');
      /*
        Doing it this way, to hopefully save a couple MS in compute in AWS Lambda,
        if I end up calculating this for whole realms of multiple items at a time.
       */
      if (daysSince <= 14) {
        if (!isMinimal) {
          itemStats.past14Days = this.getEntryValues(itemStats.past14Days, hour, priceDiff, quantityDiff);
        }

        if (daysSince <= 7) {
          itemStats.past7Days = this.getEntryValues(itemStats.past7Days, hour, priceDiff, quantityDiff);

          if ( daysSince <= 1) {
            itemStats.past24Hours = this.getEntryValues(itemStats.past24Hours, hour, priceDiff, quantityDiff);

            if (hoursSince <= 12 && !isMinimal) {
              itemStats.past12Hours = this.getEntryValues(itemStats.past12Hours, hour, priceDiff, quantityDiff);
            }
          }
        }
      }
    });
    this.setResultForPeriod(result.past7Days, itemStats.past7Days);
    this.setResultForPeriod(result.past24Hours, itemStats.past24Hours);
    if (!isMinimal) {
      this.setResultForPeriod(result.past14Days, itemStats.past14Days);
      this.setResultForPeriod(result.past12Hours, itemStats.past12Hours);
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

  private static getBaseItemStatItem(hours: ItemPriceEntry[], isMinimal: boolean): ItemStats {
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
    }

    if (hours[0].petSpeciesId) {
      vals.petSpeciesId = hours[0].petSpeciesId;
    }
    if (hours[0].bonusIds) {
      vals.bonusIds = hours[0].bonusIds;
    }
    return vals;
  }

  private static getEntryValues(entry: Stat, hour: ItemPriceEntry, priceDiff: number, quantityDiff: number): Stat {
    const {price, quantity, totalEntries} = {...entry};
    return {
      price: {
        trend: priceDiff + price.trend,
        avg: hour.min + price.avg,
      },
      quantity: {
        trend: quantityDiff + quantity.trend,
        avg: hour.quantity + quantity.avg,
      },
      totalEntries: totalEntries + 1,
    };
  }
}
