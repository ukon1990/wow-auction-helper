export class WoWHead {
  // createdBy: WoWHeadCreatedBy[];
  soldBy: WoWHeadSoldBy[];
  taughtBy: WoWHeadTaughtBy[];
  droppedBy: WoWHeadDroppedBy[];
  expansionId: number;
  // disenchantedFrom: WoWHeadDisenchantedFrom[];
  // containedIn: WoWHeadContainedIn[];
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

export class WoWHeadDroppedBy {}

export class WoWHeadContainedIn {}

export class WoWHeadCurrencyFor {}

export class WoWHeadObjectiveOf {}

export class WoWHeadDisenchantedFrom {}