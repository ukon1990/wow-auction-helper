import { Request, Response } from "express";
import { Item } from "../models/item/item";

/**
 * GET /api/item
 * List of API examples.
 */
export let getAuctions = (req: Request, res: Response) => {
    res.send({
      message: "There is nothing here"
    });
  };