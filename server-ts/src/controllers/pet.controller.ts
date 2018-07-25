import { Request, Response } from 'express';
import { PetUtil } from '../util/pet.util';

/**
 * GET /api/item
 * List of API examples.
 */
export let getPets = (req: Request, res: Response) => {
  PetUtil.getPets(res, req);
};

/**
 * GET /api/item
 * List of API examples.
 */
export let getPet = (req: Request, res: Response) => {
  PetUtil.getPet(req.params.id, res, req);
};