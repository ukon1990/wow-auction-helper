// For: Auctioneer_Stats_OverTime.lua
import {AuctionItem} from '../models/auction-item.model';
import {LuaUtil} from './lua.util';

/**
 * Struct
 * Realms:
 *  timestamp:
 *    - count
 *    - price
 */
export class AuctioneerStatsOverTimeUtil {
  static import(data: any): void {
    const auctionItems = new Map<number, AuctionItem>();
    const realms = {};
    const result = LuaUtil.toObject(data);
    Object.keys(result)
      .forEach(realm => {
        const realmStat = result[realm],
          realmStatList = Object.keys(realmStat).map(timestamp =>
            ({timestamp: +timestamp, data: realmStat[timestamp]}))
            .sort((a, b) =>
              b.timestamp - a.timestamp);
        console.log('realmStatList', realmStatList);
      });
  }
}
