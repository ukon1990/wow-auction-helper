import {APIRecipe} from '../shared/models';

export interface RecipeAPIResponse {
  timestamp: number;
  recipes: APIRecipe[];
}