import {Auction} from '@shared/models';
import {Character} from '../../character/models/character.model';
import {AuctionItem} from './auction-item.model';
import {UserAuctionCharacter} from './user-auction-character.model';

export class UserAuctions {
  auctions: Array<Auction> = new Array<Auction>();
  undercutAuctions = 0;
  auctionWorth = 0;
  characters: Array<UserAuctionCharacter> = new Array<UserAuctionCharacter>();
  charactersMap: Map<string, Map<string, UserAuctionCharacter>> = new Map<string, Map<string, UserAuctionCharacter>>();

  constructor() {}

  addAuction(auction: Auction, auctionItem: AuctionItem): void {
    const realm = auction.ownerRealm.toLowerCase();
    if (this.charactersMap[realm] && this.charactersMap[realm][auction.owner]) {
      this.auctionWorth += auction.buyout;
      this.charactersMap[realm][auction.owner].auctionWorth += auction.buyout;
      this.auctions.push(auction);
      this.charactersMap[realm][auction.owner].auctions.push(auction);
    }

    auction.undercutByAmount = auction.buyout / auction.quantity - auctionItem.buyout;
  }

  countUndercuttedAuctions(auctionItemsMap: Map<number, AuctionItem>): void {
    let tmpAuctionItem: AuctionItem;
    this.characters.forEach(c => {
      c.auctions.forEach(a => {
        tmpAuctionItem = auctionItemsMap[Auction.getAuctionItemId(a)];
        // Checking if the character is undercutted
        if (tmpAuctionItem.owner !== c.name &&
            a.buyout / a.quantity > tmpAuctionItem.buyout) {
          c.undercutAuctions++;
        }

        // Checking if the user is undercutted
        if (!this.charactersMap[tmpAuctionItem.owner] && a.buyout / a.quantity > tmpAuctionItem.buyout) {
          this.undercutAuctions++;
        }
      });
    });
  }

  organizeCharacters(characters: Array<Character>): void {
    this.auctionWorth = 0;
    this.auctions.length = 0;
    this.undercutAuctions = 0;
    this.characters.length = 0;
    this.charactersMap = new Map<string, Map<string, UserAuctionCharacter>>();
    characters.forEach(c => {
      const realm = c.realm.toLowerCase();
      if (!this.charactersMap[realm]) {
        this.charactersMap[realm] = new Map<string, UserAuctionCharacter>();
      }
      this.charactersMap[realm][c.name] = new UserAuctionCharacter(c);
      this.characters.push(this.charactersMap[realm][c.name]);
    });
  }
}