export class WoWHead {
  // createdBy: WoWHeadCreatedBy[];
  soldBy: WoWHeadSoldBy[];
  taughtBy: WoWHeadTaughtBy[];
  droppedBy: WoWHeadDroppedBy[];
  expansionId: number;
  // disenchantedFrom: WoWHeadDisenchantedFrom[];
  containedInItem: WoWHeadContainedIn[];
  containedInObject: WoWHeadContainedIn[];
  currencyFor: WoWHeadCurrencyFor[];
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
  chance: number;
  personal_loot: number;
  pctstack: WoWHeadPctStack;
}

export class WoWHeadPctStack {
  1: number;
  2: number;
  3: number;
}

export class WoWHeadContainedIn { }

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