import {QueryUtil} from '../utils/query.util';
import {AuctionItemStat} from './models/auction-item-stat.model';

export class AuctionQuery {
  static multiInsertOrUpdate(list: AuctionItemStat[], hour: number): string {
    const formattedHour = (hour < 10 ? '0' + hour : '' + hour);

    const insert = new QueryUtil('itemPriceHistoryPerHour')
      .multiInsert(list)
      .replace(';', '');
    return `${insert} ON DUPLICATE KEY UPDATE
      price${formattedHour} = VALUES(price${formattedHour}),
      quantity${formattedHour} = VALUES(quantity${formattedHour});`;
  }

  static multiInsertOrUpdateDailyPrices(list: AuctionItemStat[], day: string): string {
    const insert = new QueryUtil('itemPriceHistoryPerDay')
      .multiInsert(list)
      .replace(';', '');
    return `${insert} ON DUPLICATE KEY UPDATE
      min${day} = VALUES(min${day}),
      minHour${day} = VALUES(minHour${day}),
      avg${day} = VALUES(avg${day}),
      max${day} = VALUES(max${day}),
      minQuantity${day} = VALUES(minQuantity${day}),
      avgQuantity${day} = VALUES(avgQuantity${day}),
      maxQuantity${day} = VALUES(maxQuantity${day});`;
  }
}
