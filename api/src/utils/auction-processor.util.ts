/*
  The intention with this class
  Is to gather price statistics for the lowest, highest and avg prices
*/
import {Auction} from '../models/auction/auction';
import {QueryUtil} from './query.util';

class Bonus {
  bonusListId: number;
}

class AuctionItemStat {
  itemId: number;
  petSpeciesId = -1;
  min: number;
  max: number;
  avg: number;
  quantity: number;

  constructor(public ahId: number, public bonusIds: string, auction: Auction, public timestamp: number) {
    this.itemId = auction.item;
    this.quantity = auction.quantity;
    this.min = auction.buyout / auction.quantity;
    this.max = auction.buyout / auction.quantity;
    this.avg = auction.buyout / auction.quantity;
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
    const list: AuctionItemStat[] = [], map = {}, queries = [];
    if (!auctions) {
      return '';
    }
    for (let i = 0, l = auctions.length; i < l; ++i) {
      this.processAuction(map, list, auctions[i], lastModified, ahId);
    }
    console.log(`Processed ${auctions.length} in ${+new Date() - start} ms`);
    return new QueryUtil('itemPriceHistory', false).multiInsert(list);
  }

  private static processAuction(map: any, list: AuctionItemStat[], auction: Auction, lastModified: number, ahId: number) {
    const id = AuctionItemStat.bonusId(auction.bonusLists),
      mapId = this.getMapId(auction, id),
      unitPrice = auction.buyout / auction.quantity;
    if (!unitPrice) {
      return;
    }

    if (!map[mapId]) {
      map[mapId] = new AuctionItemStat(ahId, id, auction, lastModified);
      list.push(map[mapId]);
    } else {
      // Add something like avg price variation?
      const item: AuctionItemStat = map[mapId];
      if (item.min > unitPrice) {
        item.min = unitPrice;
      }

      if (item.max < unitPrice) {
        item.max = unitPrice;
      }

      item.quantity += auction.quantity;
      item.avg = (item.avg + unitPrice) / 2;
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
