import { Request, Response } from 'express';
import { AuctionUtil } from '../util/auction.util';



/**
 * POST /api/auction
 * List of API examples.
 */
export const getAuctions = (req: Request, res: Response) => {
  AuctionUtil.getAuctions(req, res);
};

export const getWoWUction =
  (req: Request, res: Response) => {
    AuctionUtil.getWoWUction(req, res);
  };

export const getSnapshotForRealm = (req: Request, res: Response) => {
  AuctionUtil.getSnapshotForRealm(req, res);
};
