import { Request, Response } from "express";
import mysql from "mysql";
import { Item } from "../models/item/item";

export class ItemUtil {
    public static handleItemsRequest(error: Error, items: Item[], response: Response, db: mysql.Connection) {
        if (!error) {
            items.forEach(item =>
                ItemUtil.handleItem);
        }

        db.end();
        response.send({
            items: items ? items : []
        });
    }

    public static handleItem (item: Item) {
        item.itemSource = item.itemSource as any === "[]" ?
            [] : JSON.parse((item.itemSource as any).replace(/[\n]/g, ""));
         // TODO: Fix some issues regarding this json in the DB - r.itemSpells
        item.itemSpells = item.itemSpells as any === "[]" ? [] : [];
    }
}
