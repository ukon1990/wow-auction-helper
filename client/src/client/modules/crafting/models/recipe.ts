import {Recipe as APIRecipe} from '../../../../../../api/src/recipe/model';
import {Reagent} from './reagent';

export class Recipe extends APIRecipe {
  // Added by the client
  itemID: number;
  icon: string;
  reagents: Reagent[] = [];
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
