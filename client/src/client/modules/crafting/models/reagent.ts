import {Recipe} from './recipe';

export class Reagent {
  name: string;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;
  avgPrice?: number;
  intermediateCount = 0;

  constructor(public itemID?: number, public count?: number) {
  }
}
