export class WoWHead {
  // createdBy: WoWHeadCreatedBy[];
  soldBy: WoWHeadSoldBy[];
  taughtBy: WoWHeadTaughtBy[];
  droppedBy: WoWHeadDroppedBy[];
  expansionId: number;
  // disenchantedFrom: WoWHeadDisenchantedFrom[];
  containedInItem: WoWHeadContainedInItem[];
  containedInObject: WoWHeadContainedInObject[];
  currencyFor: WoWHeadCurrencyFor[];
  prospectedFrom: WoWHeadProspectedFrom[];
  milledFrom: WoWHeadProspectedFrom[];
  // objectiveOf: WoWHeadObjectiveOf[];
}

export class WoWHeadSoldBy {
  id: number;
  name: string;
  tag: string;
  classification: number;
  location: number[];
  react: number[];
  type: number;
  cost: any;
  stock: number;
  currency: number;
}

export class WoWHeadCreatedBy { }

export class WoWHeadTaughtBy { }

export class WoWHeadDroppedBy {

  classification: number;
  id: number;
  location: number[];
  name: string;
  react: number[];
  type: number;
  count: number;
  outof: number;
  dropChance: number;
  personal_loot: number;
  pctstack: WoWHeadPctStack;
}

export class WoWHeadProspectedFrom {
  classs: number;
  flags2: number;
  id: number;
  level: number;
  name: string;
  slot: number;
  source: number[];
  subclass: number;
  count: number;
  outof: number;
  sourcemore: any;
  stack: number[];
  pctstack: WoWHeadPctStack;
  dropChance: number;
}

export class WoWHeadPctStack {
}

export class WoWHeadContainedInItem {
  classs: number;
  commondrop: boolean;
  flags2: number;
  id: number;
  level: number;
  name: string;
  slot: number;
  source: number[];
  subclass: number;
  count: number;
  outof: number;
  dropChance: number;
}

export class WoWHeadContainedInObject {
  id: number;
  location: number[];
  name: string;
  type: number;
  count: number;
  outof: number;
  dropChance: number;
}

export class WoWHeadCurrencyFor {
  classs: number;
  flags2: number;
  id: number;
  level: number;
  name: string;
  namedesc: string;
  reqlevel: number;
  skill: number;
  slot: number;
  source: number[];
  sourcemore: WoWHeadCurrencyForSourceMore[];
  subclass: number;
  cost: any;
  currency: number;
  stack: number[];
}

export class WoWHeadCurrencyForSourceMore {
  n: string;
  t: number;
  ti: number;
  z: number;
}

export class WoWHeadObjectiveOf { }

export class WoWHeadDisenchantedFrom { }