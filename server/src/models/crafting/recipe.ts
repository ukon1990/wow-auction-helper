import { Reagent } from './reagent';

export class Recipe {
  spellID: number;
  itemID: number;
  name = 'Missing recipe data';
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
  mktPrice?: number = 0;
  avgDailySold?: number = 0;
  regionSaleAvg?: number = 0;
  regionSaleRate?: number = 0;
  buyout?: number = 0;
  quantityTotal?: number = 0;
}
