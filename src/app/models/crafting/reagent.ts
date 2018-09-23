import { Recipe } from './recipe';

export class Reagent {
  itemID: number;
  name: string;
  count: number;
  dropped: boolean;
  intermediateEligible?: boolean;
  recipe?: Recipe;
}
