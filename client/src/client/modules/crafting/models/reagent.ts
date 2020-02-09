import {Recipe} from './recipe';

export class Reagent {
  name: string;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;
  avgPrice?: number;

  constructor(public itemID?: number, public count?: number) {
  }
}
