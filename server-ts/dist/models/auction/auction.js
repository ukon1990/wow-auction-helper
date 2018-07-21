"use strict";
/**
{
  "auc":261541141,
  "item":118812,
  "owner":"Slixxery",
  "ownerRealm":"Draenor",
  "bid":94999990500,
  "buyout":99999990000,
  "quantity":1,
  "timeLeft":"VERY_LONG",
  "rand":0,
  "seed":0,
  "context":6,
  "modifiers":[
    {"type":3,"value":1706},
    {"type":4,"value":50331654},
    {"type":5, "value":1}
  ],
  "petSpeciesId":1706,
  "petBreedId":6,
  "petLevel":1,
  "petQualityId":3,
  "bonusLists":[
    {"bonusListId":563},
    {"bonusListId":40}
  ]
}
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Auction {
    constructor(auc, item, buyout, quantity, owner, ownerRealm) {
        this.auc = auc;
        this.item = item;
        this.buyout = buyout;
        this.quantity = quantity;
        this.owner = owner;
        this.ownerRealm = ownerRealm;
    }
}
exports.Auction = Auction;
class Bonus {
}
class Modifiers {
}
//# sourceMappingURL=auction.js.map