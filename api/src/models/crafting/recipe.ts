import {Recipe as APIRecipe} from '../../../../api/src/recipe/model';
import {ItemLocale} from '../item/item-locale';

export class Recipe extends APIRecipe {
  name = 'Missing recipe data';
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
