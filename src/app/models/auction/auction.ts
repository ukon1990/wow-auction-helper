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
}
