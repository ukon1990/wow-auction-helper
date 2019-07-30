import {Request, Response} from 'express';
import {RealmUtil} from '../util/realm.util';

export let getRealmStatus = (req: Request, res: Response) => {
  RealmUtil.getRealmStatus(res, req);
};
