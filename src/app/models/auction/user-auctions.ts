import { Auction } from './auction';
import { Character } from '../character/character';
import { AuctionItem } from './auction-item';

export class UserAuctions {
  auctions: Array<Auction> = new Array<Auction>();
  undercutAuctions = 0;
  auctionWorth = 0;
  characters: Array<UserAuctionCharacter> = new Array<UserAuctionCharacter>();
  charactersMap: Map<string, Map<string, UserAuctionCharacter>> = new Map<string, Map<string, UserAuctionCharacter>>();

  constructor() {}

  addAuction(auction: Auction, auctionItemsMap: Map<number, AuctionItem>): void {
    if (this.charactersMap[auction.ownerRealm] && this.charactersMap[auction.ownerRealm][auction.owner]) {
      if (auctionItemsMap[auction.item].buyout < auction.buyout) {
        this.undercutAuctions++;
        this.charactersMap[auction.ownerRealm][auction.owner].undercutAuctions++;
      }
      this.auctionWorth += auction.buyout;
      this.charactersMap[auction.ownerRealm][auction.owner].auctionWorth += auction.buyout;
      this.auctions.push(auction);
      this.charactersMap[auction.ownerRealm][auction.owner].auctions.push(auction);
    }
  }

  organizeCharacters(characters: Array<Character>): void {
    this.auctionWorth = 0;
    this.auctions.length = 0;
    this.undercutAuctions = 0;
    this.characters.length = 0;
    this.charactersMap = new Map<string, Map<string, UserAuctionCharacter>>();
    characters.forEach(c => {
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
  undercutAuctions = 0;
  auctionWorth = 0;
  auctions: Array<Auction> = new Array<Auction>();

  constructor(character: Character) {
    this.realm = character.realm;
    this.name = character.name;
    this.character = character;
  }
}
