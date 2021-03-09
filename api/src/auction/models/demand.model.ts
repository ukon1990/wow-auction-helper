import {Auction} from '../../models/auction/auction';

export class DemandDiff {
  // ahId: number;
  itemId: number;
  petSpeciesId: string;
  bonusIds: string;
  // date: string;

  demand: number;
  new: number;
  removed: number;
  totalCountDiff: number;

  previousAuctions = new Map<number, Auction>();
  currentAuctions = new Map<number, Auction>();
  newAuctions = new Map<number, Auction>();
  expiredSoldOrCancelledAuctions = new Map<number, Auction>();

  constructor(auction: Auction) {
    this.itemId = auction.item;
    this.petSpeciesId = `${auction.petSpeciesId || '-1'}`;
    this.bonusIds = auction.bonusLists.map(b => b.bonusListId).join(',');
  }
}

export interface Demand {
  ahId: number;
  itemId: number;
  petSpeciesId: string;
  bonusIds: string;
  date: string;

  demand: number;
  new: number;
  removed: number;
}
