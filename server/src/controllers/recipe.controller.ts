import {Request, Response} from 'express';
import {RecipeUtil} from '../util/recipe.util';
import {BFALists} from '../bfa-recipe-list';

/**
 * GET /api/recipe
 * List of API examples.
 */
export let postRecipes = (req: Request, res: Response) => {
  RecipeUtil.postRecipes(res, req);
};

export let patchRecipes = (req: Request, res: Response) => {
  RecipeUtil.patchRecipe(req.params.id, res, req);
};

/**
 * GET /api/recipe/:id
 * List of API examples.
 */
export let getRecipe = (req: Request, res: Response) => {
  RecipeUtil.getRecipe(req.params.id, res, req);
};

export let getItemsToAdd = (req: Request, res: Response) => {
  RecipeUtil.getItemsToAdd(BFALists.recipeIds, res, req);
};
