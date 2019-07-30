import {Request, Response} from 'express';
import * as mysql from 'mysql';
import {Item} from '../models/item/item';
import {DATABASE_CREDENTIALS} from '../util/secrets';
import {ItemUtil} from '../util/item.util';
import {WoWHead} from '../models/item/wowhead';
import {BFALists} from '../bfa-recipe-list';
import {ItemQuery} from '../queries/item.query';

export const getItem = async (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(ItemQuery.getById(req),
    (err, rows) =>
      ItemUtil.getItem(req.params.id, err, rows as Item[], res, req, db));
};

export const updateItem = async (req: Request, res: Response) => {
  ItemUtil.patchItem(req.params.id, res, req);
};

/**
 * GET /api/item
 * List of API examples.
 */
export const getItems = (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(ItemQuery.getAllItemsOrderByTimestamp(req),
    (err, rows) =>
      ItemUtil.getItems(err, rows as Item[], res, db));
};

/**
 * GET /api/item
 * List of API examples.
 */
export const postItems = (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(ItemQuery.getAllAuctionsAfterAndOrderByTimestamp(req),
    (err, rows) =>
      ItemUtil.getItems(err, rows as Item[], res, db));
};

export const getItemSources = (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(ItemQuery.getItemSourceForId(req),
    (err, rows) => {
      if (err || rows.length === 0) {
        res.send(new WoWHead());
      } else {
        res.send(JSON.parse(rows.itemSource));
      }
    });
};

export const updateItems = async (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(
    ItemQuery.getItemsToUpdate(),
    (err, rows, fields) => {
      db.end();
      ItemUtil.patchItems(rows, res, req);
    });
};

export const getItemsFromList = async (req: Request, res: Response) => {
  console.log('Yo');
  // ItemUtil.setMissingLocales(req, res);
  ItemUtil.getItemsToAdd(BFALists.itemIds, res, req);
};

export const getWoWDBItem = (req: Request, res: Response) =>
  ItemUtil.getWoWDB;
