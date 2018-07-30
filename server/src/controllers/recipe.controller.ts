import { Request, Response } from 'express';
import { RecipeUtil } from '../util/recipe.util';

/**
 * GET /api/recipe
 * List of API examples.
 */
export let postRecipes = (req: Request, res: Response) => {
  RecipeUtil.postRecipes(res, req);
};

/**
 * GET /api/recipe/:id
 * List of API examples.
 */
export let getRecipe = (req: Request, res: Response) => {
  RecipeUtil.getRecipe(req.params.id, res, req);
};