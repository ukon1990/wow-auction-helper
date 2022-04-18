import {Auction, ItemLocale} from '../../models';

export class Pet {
  speciesId: number;
  petTypeId: number;
  creatureId: number;
  name: string;
  nameLocales: ItemLocale;
  icon: string;
  description: string;
  source: string;
  canBattle: boolean;
  isCapturable: boolean;
  isTradable: boolean;
  timestamp?: string;
  assets: {
    key: string;
    value: string;
  }[];
  auctions = new Array<Auction>();
}