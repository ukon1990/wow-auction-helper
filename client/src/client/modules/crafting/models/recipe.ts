import { Reagent } from './reagent';

export class Recipe {
  id: number;
  spellID: number;
  itemID: number;
  name = 'Missing recipe data';
  icon: string;
  profession?: string;
  rank?: string;
  minCount: number;
  maxCount: number;
  reagents: Array<Reagent>;
  expansion?: number;
  flaggedAsBugged?: boolean;

  // Applied after cost calculation
  cost = 0;
  roi = 0;

  // Fetched for the current auctions
  mktPrice = 0;
  avgDailySold = 0;
  regionSaleAvg = 0;
  regionSaleRate = 0;
  buyout = 0;
  quantityTotal = 0;
  procRate = 1;
}
