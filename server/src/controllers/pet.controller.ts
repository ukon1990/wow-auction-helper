import { Request, Response } from 'express';
import { PetUtil } from '../util/pet.util';

/**
 * GET /api/pet
 */
export let postPets = (req: Request, res: Response) => {
  PetUtil.postPets(res, req);
};

/**
 * GET /api/pet/:id
 * List of API examples.
 */
export let getPet = (req: Request, res: Response) => {
  PetUtil.getPet(req.params.id, res, req);
};

/**
 * PATCH /api/pet/:id
 */
export let patchPet = (req: Request, res: Response) => {
 PetUtil.patchPet(req, res);
};