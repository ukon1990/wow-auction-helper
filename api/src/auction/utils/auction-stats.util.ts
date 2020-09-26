import {ItemStats} from '../models/item-stats.model';
import {AuctionProcessorUtil} from './auction-processor.util';
import {AuctionItemStat} from '../models/auction-item-stat.model';

export class AuctionStatsUtil {
  static processDays(rows: AuctionItemStat[]): ItemStats[] {
    const hours = AuctionProcessorUtil.processHourlyPriceData(rows);
    // rows.forEac

    return [];
  }
}
