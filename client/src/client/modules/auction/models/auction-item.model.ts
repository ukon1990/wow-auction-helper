import {Auction} from './auction.model';
import {Recipe} from '../../crafting/models/recipe';
import {NPC} from '../../npc/models/npc.model';
import {ItemNpcDetails} from '../../item/models/item-npc-details.model';
import {Item} from '../../../models/item/item';

export class AuctionItem {
  id: string;
  petSpeciesId?: number;
  name = 'Unavailable';
  itemLevel = 0;
  quality: number;
  buyout = 0;
  bid = 0;
  bonusIds: number[];
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
  past60DaysSaleRate?: number;
  past90DaysSaleRate?: number;
  totalSaleRate?: number;
  hasPersonalSaleRate: boolean;

  recipes: {
    known: Recipe[],
    all: Recipe[]
    materialFor: Recipe[]
  } = {
    known: [],
    all: [],
    materialFor: []
  };
  shuffle = {
    sourceIn: [],
    targetIn: []
  };
  npcDetails: ItemNpcDetails;
  item: Item;

  constructor(public itemID?: number) {
  }
}
