
export class Auction {
  auc: number;
  item: number;
  bid = 0;
  buyout = 0;
  owner: string;
  ownerRealm: string;
  quantity = 0;
  timeLeft: string;
  context: number;
  rand: number;
  seed: number;
  petSpeciesId?: number;
  petBreedId?: number;
  petLevel?: number;
  petQualityId?: number;
  bonusLists?: Array<Bonus>;
  modifiers?: Array<Modifiers>;

  undercutByAmount?: number;
  roi?: number;

  constructor(auc?: number, item?: number, buyout?: number, quantity?: number, owner?: string, ownerRealm?: string) {
    if (auc) {
      this.auc = auc;
    }
    if (item) {
      this.item = item;
    }
    if (buyout) {
      this.buyout = buyout;
    }
    if (quantity) {
      this.quantity = quantity;
    }
    if (owner) {
      this.owner = owner;
    }
    if (ownerRealm) {
      this.ownerRealm = ownerRealm;
    }
  }

  public static getAuctionItemId(auction: Auction): any {
    if (auction.petSpeciesId) {
      return `${auction.item}-${auction.petSpeciesId}-${auction.petLevel}-${auction.petQualityId}`;
    }
    return auction.item;
  }

  public static getBonusList(auction: Auction): string {
    if (auction.bonusLists) {
      return auction.bonusLists.join(':');
    }
    return [].join(':');
  }
}

interface Bonus {
  bonusListId: number;
}

interface Modifiers {
  type: number;
  value: number;
}
