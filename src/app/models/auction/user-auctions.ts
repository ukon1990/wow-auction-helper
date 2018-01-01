import { Auction } from './auction';
import { SharedService } from '../../services/shared.service';
import { Character } from '../character/character';

export class UserAuctions {
  auctions: Array<Auction> = new Array<Auction>();
  characters: Array<UserAuctionCharacter> = new Array<UserAuctionCharacter>();
  charactersMap: Map<string, Map<string, UserAuctionCharacter>> = new Map<string, Map<string, UserAuctionCharacter>>();

  constructor() {}

  addAuction(auction: Auction): void {
    if (this.charactersMap[auction.ownerRealm] && this.charactersMap[auction.ownerRealm][auction.owner]) {
      this.auctions.push(auction);
      this.charactersMap[auction.ownerRealm][auction.owner].auctions.push(auction);
    }
  }

  organizeCharacters(): void {
    SharedService.user.characters.forEach(c => {
      if (!this.charactersMap[c.realm]) {
        this.charactersMap[c.realm] = new Map<string, UserAuctionCharacter>();
      }
      this.charactersMap[c.realm][c.name] = new UserAuctionCharacter(c);
      this.characters.push(this.charactersMap[c.realm][c.name]);
    });
  }
}

export class UserAuctionCharacter {
  realm: string;
  name: string;
  character: Character;
  auctions: Array<Auction> = new Array<Auction>();

  constructor(character: Character) {
    this.realm = character.realm;
    this.name = character.name;
    this.character = character;
  }
}
