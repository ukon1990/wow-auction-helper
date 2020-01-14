/*
  The intention with this class
  Is to gather price statistics for the lowest, highest and avg prices
*/
import {Auction} from '../models/auction/auction';
import {QueryUtil} from './query.util';

class Bonus {
  bonusListId: number;
}

export class AuctionItemStat {
  itemId: number;
  petSpeciesId = -1;
  bonusIds: number[];
  min: number;
  max: number;
  avg: number;
  quantity: number;

  constructor(public ahId: number, auction: Auction, public timestamp: number) {
    this.itemId = auction.item;
    this.quantity = auction.quantity;
    this.min = auction.buyout / auction.quantity;
    this.max = auction.buyout / auction.quantity;
    this.avg = auction.buyout / auction.quantity;
    if (auction.petSpeciesId) {
      this.petSpeciesId = auction.petSpeciesId;
    }

    this.setBonusIds(auction);
  }

  static bonusId(ids: Bonus[]): string {
    if (!ids) {
      return 'b-0';
    }
    return 'b-' + ids.map(id => id.bonusListId)
      .sort((a, b) => a - b)
      .join('-');
  }

  private setBonusIds(auction: Auction) {
    if (!auction.bonusLists) {
      return;
    }
    this.bonusIds = auction.bonusLists.map(id => id.bonusListId)
      .sort((a, b) => a - b);
  }
}

export class AuctionProcessorUtil {
  static process(auctions: Auction[], lastModified: number, ahId: number): Map<string, AuctionItemStat> {
    const map = new Map<string, AuctionItemStat>();
    if (!auctions) {
      return map;
    }
    for (let i = 0, l = auctions.length; i < l; ++i) {
      this.processAuction(map, auctions[i], lastModified, ahId);
    }
    return map; // new QueryUtil('itemPriceLog', false).multiInsert(list);
  }

  private static processAuction(map: any, auction: Auction, lastModified: number, ahId: number) {
    const id = AuctionItemStat.bonusId(auction.bonusLists),
      mapId = this.getMapId(auction, id),
      unitPrice = auction.buyout / auction.quantity;
    if (!unitPrice) {
      return;
    }

    if (!map[mapId]) {
      map[mapId] = new AuctionItemStat(ahId, auction, lastModified);
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
    let mapId = 'i-' + auction.item + id;
    if (auction.petSpeciesId) {
      mapId += 'p-' + auction.petSpeciesId;
    }
    return mapId;
  }
}
