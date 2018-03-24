import { AuctionItem } from './auction/auction-item';

export class Pet {
  speciesId: number;
  petTypeId: number;
  creatureId: number;
  name: string;
  icon: string;
  description: string;
  source: string;
  auctions = new Array<AuctionItem>();
}
