import {Reagent} from './reagent';
import {ItemLocale} from '../item/item-locale';

export class Recipe {
  spellID: number;
  itemID: number;
  name: string | ItemLocale = 'Missing recipe data';
  profession?: string;
  rank?: string;
  minCount: number;
  maxCount: number;
  reagents: Array<Reagent>;
  expansion?: number;

  // Applied after cost calculation
  cost?: number;
  roi?: number;

  // Fetched for the current auctions
  mktPrice = 0;
  avgDailySold = 0;
  regionSaleAvg = 0;
  regionSaleRate = 0;
  buyout = 0;
  quantityTotal = 0;
}

/**
 * The recipe object returned by blizzards API
 */
export interface RecipeSpell {
  id: number;
  name: string;
  profession: string;
  icon: string;
}
