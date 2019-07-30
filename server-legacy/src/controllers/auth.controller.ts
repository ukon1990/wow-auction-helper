import {Request, Response} from 'express';
import {AuthUtil} from '../util/auth.util';


/**
 * POST /api/auction
 * List of API examples.
 */
export const updateAuthToken = (req: Request, res: Response) => {
  AuthUtil.setToken(res);
};
