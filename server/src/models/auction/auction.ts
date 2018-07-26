export class Auction {
  auc: number;
  item: number;
  bid: number;
  buyout: number;
  owner: string;
  ownerRealm: string;
  quantity: number;
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
    this.auc = auc;
    this.item = item;
    this.buyout = buyout;
    this.quantity = quantity;
    this.owner = owner;
    this.ownerRealm = ownerRealm;
  }
}

class Bonus {
  bonusListId: number;
}

class Modifiers {
  type: number;
  value: number;
}
