import { Auction } from './auction';

export class AuctionItem {
  itemID: number;
  petSpeciesId?: number;
  name = 'Unavailable';
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
}
