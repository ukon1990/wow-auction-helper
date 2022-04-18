import {Character} from '../../character/models/character.model';
import {Auction} from '@shared/models';

export class UserAuctionCharacter {
  realm: string;
  name: string;
  character: Character;
  undercutAuctions = 0;
  auctionWorth = 0;
  auctions: Array<Auction> = new Array<Auction>();

  constructor(character: Character) {
    this.realm = character.realm.toLowerCase();
    this.name = character.name;
    this.character = character;
  }
}