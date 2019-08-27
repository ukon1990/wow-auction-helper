import {Auction} from './auction.model';
import {TSM} from './tsm.model';

export class AuctionItem {
  itemID: number;
  petSpeciesId?: number;
  name = 'Unavailable';
  itemLevel = 0;
  buyout = 0;
  bid = 0;
  owner: string;
  ownerRealm: string;
  petLevel?: number;
  petQualityId?: number;
  auctions: Auction[] = new Array<Auction>();
  regionSaleRate = 0;
  avgDailySold = 0;
  avgDailyPosted = 0;
  regionSaleAvg = 0;
  mktPrice = 0;
  vendorSell = 0;
  quantityTotal = 0;

  past24HoursSaleRate?: number;
  past7DaysSaleRate?: number;
  past14DaysSaleRate?: number;
  past30DaysSaleRate?: number;
  past90DaysSaleRate?: number;
  totalSaleRate?: number;
  hasPersonalSaleRate: boolean;

  constructor(auction?: Auction, tsm?: TSM) {
    if (auction) {
      this.itemID = auction.item;
      this.petLevel = auction.petLevel;
      this.petQualityId = auction.petQualityId;
      this.petSpeciesId = auction.petSpeciesId;
    }

    if (tsm) {
      this.regionSaleAvg = tsm.RegionSaleAvg;
      this.regionSaleRate = tsm.RegionSaleRate;
      this.avgDailySold = tsm.RegionAvgDailySold;

    }
  }
}
