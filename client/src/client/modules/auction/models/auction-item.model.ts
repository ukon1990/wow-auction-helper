import {Auction, Modifiers} from './auction.model';
import {Recipe} from '../../crafting/models/recipe';
import {Item} from '../../../models/item/item';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {TradeVendorItemValue} from '../../../models/item/trade-vendor';
import {ItemStats} from '../../../../../../api/src/auction/models/item-stats.model';

export class AuctionItem {
  id: string;
  petSpeciesId?: number;
  name = 'Unavailable';
  itemLevel = 0;
  quality: number;
  buyout = 0;
  bid = 0;
  bonusIds: number[];
  modifiers: Modifiers[];
  owner: string;
  ownerRealm: string;
  petLevel?: number;
  petQualityId?: number;
  auctions: Auction[] = [];
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
  past60DaysSaleRate?: number;
  past90DaysSaleRate?: number;
  totalSaleRate?: number;
  hasPersonalSaleRate: boolean;

  item: Item;
  source: {
    tradeVendor: TradeVendorItemValue;
    recipe: {
      known: Recipe[],
      all: Recipe[]
      materialFor: Recipe[]
    },
    shuffle: {
      sourceIn: [],
      targetIn: []
    },
    npc: ItemNpcDetails
  } = {
    recipe: {
      known: [],
      all: [],
      materialFor: []
    },
    shuffle: {
      sourceIn: [],
      targetIn: []
    },
    npc: undefined,
    tradeVendor: undefined
  };
  stats?: ItemStats;

  constructor(public itemID?: number) {
  }
}
