import {Request, Response} from 'express';
import {CharacterUtil} from '../util/character.util';


/**
 * POST /api/auction
 * List of API examples.
 */
export const getCharacter = (req: Request, res: Response) => {
  CharacterUtil.get(req, res);
};

