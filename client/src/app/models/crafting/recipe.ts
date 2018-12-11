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
  flaggedAsBugged?: boolean;

  // Applied after cost calculation
  cost?: number;
  roi?: number;

  // Fetched for the current auctions
  mktPrice? = 0;
  avgDailySold? = 0;
  regionSaleAvg? = 0;
  regionSaleRate? = 0;
  buyout? = 0;
  quantityTotal? = 0;
}
