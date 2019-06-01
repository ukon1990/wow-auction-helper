import { AuctionItem } from '../../auction/models/auction-item.model';

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
