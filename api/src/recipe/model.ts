import {APIRecipe} from "@shared/models/profession/recipe.model";

export interface RecipeAPIResponse {
  timestamp: number;
  recipes: APIRecipe[];
}