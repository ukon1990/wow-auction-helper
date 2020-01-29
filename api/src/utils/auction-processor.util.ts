/*
  The intention with this class
  Is to gather price statistics for the lowest, highest and avg prices
*/
import {Auction} from '../models/auction/auction';
import {QueryUtil} from './query.util';
import {AuctionQuery} from '../queries/auction.query';

class Bonus {
  bonusListId: number;
}

export class AuctionItemStat {
  itemId: number;
  petSpeciesId = -1;
  date: string;

  constructor(public ahId: number, public bonusIds: string, auction: Auction, timestamp: number, hour: string) {
    const date = new Date(timestamp),
      dateString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    this.itemId = auction.item;
    this.date = dateString;
    this[`quantity${hour}`] = auction.quantity;
    this[`price${hour}`] = auction.buyout / auction.quantity;
    if (auction.petSpeciesId) {
      this.petSpeciesId = auction.petSpeciesId;
    }
  }

  static bonusId(ids: Bonus[]): string {
    if (!ids) {
      return '-1';
    }
    return ids.map(id => id.bonusListId)
      .sort((a, b) => a - b)
      .join(',');
  }
}

export class AuctionProcessorUtil {
  static process(auctions: Auction[], lastModified: number, ahId: number): string {
    const start = +new Date();
    const list: AuctionItemStat[] = [], map = {}, queries = [], hour = new Date(lastModified).getUTCHours();
    if (!auctions) {
      return '';
    }
    const date = new Date(lastModified),
      dateString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    console.log('Date is ' + dateString + ' Hour= ' + hour);
    for (let i = 0, l = auctions.length; i < l; ++i) {
      this.processAuction(map, list, auctions[i], lastModified, ahId, (hour < 10 ? '0' + hour : '' + hour));
    }
    console.log(`Processed ${auctions.length} in ${+new Date() - start} ms`);
    return AuctionQuery.multiInsertOrUpdate(list, hour);
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
}
