import { Reagent } from './reagent';

export class Recipe {
  spellID: number;
  itemID: number;
  name: string;
  profession: string;
  minCount: number;
  maxCount: number;
  reagents: Array<Reagent>;

  // Applied after cost calculation
  cost?: number;
  roi?: number;
}
