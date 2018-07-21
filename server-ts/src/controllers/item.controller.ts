import { Request, Response } from "express";
import mysql from "mysql";
import { Item } from "../models/item/item";
import { DATABASE_CREDENTIALS } from "../util/secrets";
import { getLocale } from "../util/locales";
import { ItemUtil } from "../util/item.util";

/**
 * GET /api/item
 * List of API examples.
 */
export let getItems = (req: Request, res: Response) => {
  const db = mysql.createConnection(DATABASE_CREDENTIALS);
  db.query(`
      SELECT i.id, COALESCE(${ getLocale(req) }, i.name) as name, icon, itemLevel, itemClass, itemSubClass, quality, itemSpells, itemSource, buyPrice, sellPrice, itemBind, minFactionId, minReputation, isDropped, expansionId
      FROM items as i
      LEFT OUTER JOIN item_name_locale as l
      ON i.id = l.id;`,
    (err, rows, fields) =>
      ItemUtil.handleItemsRequest(err, rows as Item[], res, db));
};