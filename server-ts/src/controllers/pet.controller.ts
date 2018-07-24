import { Request, Response } from 'express';
import { PetUtil } from '../util/pet.util';

/**
 * GET /api/item
 * List of API examples.
 */
export let getPets = (req: Request, res: Response) => {
  PetUtil.getPets(req.params.id, res, req);
};