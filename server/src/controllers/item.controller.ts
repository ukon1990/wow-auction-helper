import { Request, Response } from 'express';
import mysql from 'mysql';
import { Item } from '../models/item/item';
import { DATABASE_CREDENTIALS } from '../util/secrets';
import { getLocale } from '../util/locales';
import { ItemUtil } from '../util/item.util';

export const getItem = async (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(`
    SELECT i.id, COALESCE(${ getLocale(req) }, i.name) as name, icon, itemLevel, itemClass, itemSubClass, quality, itemSpells, itemSource, buyPrice, sellPrice, itemBind, minFactionId, minReputation, isDropped, expansionId
    FROM items as i
    LEFT OUTER JOIN item_name_locale as l
    ON i.id = l.id
    WHERE i.id = ${ req.params.id };`,
  (err, rows, fields) =>
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
  db.query(`
      SELECT i.id, COALESCE(${ getLocale(req) }, i.name) as name, icon, itemLevel, itemClass, itemSubClass, quality, itemSpells, itemSource, buyPrice, sellPrice, itemBind, minFactionId, minReputation, isDropped, expansionId
      FROM items as i
      LEFT OUTER JOIN item_name_locale as l
      ON i.id = l.id;`,
    (err, rows, fields) =>
      ItemUtil.getItems(err, rows as Item[], res, db));
};

export const updateItems = async (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(
    `SELECT * FROM items WHERE timestamp < "2018-07-23";`,
    (err, rows, fields) => {
      ItemUtil.patchItems(req.params.id, rows, res, req);
    });
};

export const getWoWDBItem = (req: Request, res: Response) =>
  ItemUtil.getWoWDB;
