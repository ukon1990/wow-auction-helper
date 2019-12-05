import {Auction} from '../../auction/models/auction.model';
import {ItemLocale} from '../../../../../../api/src/models/item/item-locale';
import {Asset} from '../../../models/asset.model';

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
  timestamp?: number;
  assets: Asset[];
  auctions = new Array<Auction>();
}
