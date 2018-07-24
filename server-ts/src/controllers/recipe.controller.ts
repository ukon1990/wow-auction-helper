import { Request, Response } from 'express';
import { Item } from '../models/item/item';
import { RecipeUtil } from '../util/recipe.util';

/**
 * GET /api/recipe
 * List of API examples.
 */
export let getRecipes = (req: Request, res: Response) => {
  RecipeUtil.handleRecipeGetAllRequest(req.params.id, res, req);
};