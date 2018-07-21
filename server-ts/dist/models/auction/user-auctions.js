"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAuctions {
    constructor() {
        this.auctions = new Array();
        this.undercutAuctions = 0;
        this.auctionWorth = 0;
        this.characters = new Array();
        this.charactersMap = new Map();
    }
    addAuction(auction) {
        if (this.charactersMap[auction.ownerRealm] && this.charactersMap[auction.ownerRealm][auction.owner]) {
            this.auctionWorth += auction.buyout;
            this.charactersMap[auction.ownerRealm][auction.owner].auctionWorth += auction.buyout;
            this.auctions.push(auction);
            this.charactersMap[auction.ownerRealm][auction.owner].auctions.push(auction);
        }
    }
    countUndercuttedAuctions(auctionItemsMap) {
        let tmpAuctionItem;
        this.characters.forEach(c => {
            c.auctions.forEach(a => {
                tmpAuctionItem = auctionItemsMap[a.item];
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
    organizeCharacters(characters) {
        this.auctionWorth = 0;
        this.auctions.length = 0;
        this.undercutAuctions = 0;
        this.characters.length = 0;
        this.charactersMap = new Map();
        characters.forEach(c => {
            if (!this.charactersMap[c.realm]) {
                this.charactersMap[c.realm] = new Map();
            }
            this.charactersMap[c.realm][c.name] = new UserAuctionCharacter(c);
            this.characters.push(this.charactersMap[c.realm][c.name]);
        });
    }
}
exports.UserAuctions = UserAuctions;
class UserAuctionCharacter {
    constructor(character) {
        this.undercutAuctions = 0;
        this.auctionWorth = 0;
        this.auctions = new Array();
        this.realm = character.realm;
        this.name = character.name;
        this.character = character;
    }
}
exports.UserAuctionCharacter = UserAuctionCharacter;
//# sourceMappingURL=user-auctions.js.map