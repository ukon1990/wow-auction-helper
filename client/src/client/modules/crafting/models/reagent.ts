import {Recipe} from './recipe';

export class Reagent {
  name: string;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;

  constructor(public itemID?: number, public count?: number) {
  }
}
