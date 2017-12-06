import { Auction } from './auction';

export class AuctionItem {
  itemId: number;
  petSpeciesId: number;
  name = 'Unavailable';
  buyout = 0;
  bid = 0;
  owner: string;
  ownerRealm: string;
  auctions: Auction[] = new Array<Auction>();
  estDemand = 0;
  avgDailySold = 0;
  avgDailyPosted = 0;
  regionSaleAvg = 0;
  mktPrice = 0;
  vendorSell = 0;
  quantityTotal = 0;
}
