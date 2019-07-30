export class WoWDBItem {
  DroppedBy?: Array<NPC>;
  PossibleBonuses?: Array<ItemBonus>;
}

class NPC {
  ID: number;
  Name: string;
}

class ItemBonus {
  labe: string;
  bonusIDs: string;
}
