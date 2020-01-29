import { ItemPriceEntry } from './../../../client/src/client/modules/item/models/item-price-entry.model';
import { QueryUtil } from './../utils/query.util';
import {AuctionItemStat} from '../utils/auction-processor.util';
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
}
