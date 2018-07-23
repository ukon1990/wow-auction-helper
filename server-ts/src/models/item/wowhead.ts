export class WoWHead {
  // createdBy: WoWHeadCreatedBy[];
  soldBy: WoWHeadSoldBy[];
  taughtBy: WoWHeadTaughtBy[];
  droppedBy: WoWHeadDroppedBy[];
  expansionId: number;
  // disenchantedFrom: WoWHeadDisenchantedFrom[];
  containedInItem: WoWHeadContainedIn[];
  containedInObject: WoWHeadContainedIn[];
  // currencyFor: WoWHeadCurrencyFor[];
  // objectiveOf: WoWHeadObjectiveOf[];
}

export class WoWHeadSoldBy {
  id: number;
  name: string;
  tag: string;
  location: number[];
  react: number[];
  type: number;
  cost: any;
  stock: number;
  currency: number;
}

export class WoWHeadCreatedBy {}

export class WoWHeadTaughtBy {}

export class WoWHeadDroppedBy {

  classification: number;
  id: number;
  location: number[];
  name: string;
  react: number[];
  type: number;
  count: number;
  outof: number;
  personal_loot: number;
  pctstack: WoWHeadPctStack;
}

export class WoWHeadPctStack {
  1: number;
  2: number;
  3: number;
}

export class WoWHeadContainedIn {}

export class WoWHeadCurrencyFor {}

export class WoWHeadObjectiveOf {}

export class WoWHeadDisenchantedFrom {}