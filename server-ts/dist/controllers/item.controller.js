"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const secrets_1 = require("../util/secrets");
const locales_1 = require("../util/locales");
const item_util_1 = require("../util/item.util");
/**
 * GET /api/item
 * List of API examples.
 */
exports.getItems = (req, res) => {
    const db = mysql_1.default.createConnection(secrets_1.DATABASE_CREDENTIALS);
    db.query(`
      SELECT i.id, COALESCE(${locales_1.getLocale(req)}, i.name) as name, icon, itemLevel, itemClass, itemSubClass, quality, itemSpells, itemSource, buyPrice, sellPrice, itemBind, minFactionId, minReputation, isDropped, expansionId
      FROM items as i
      LEFT OUTER JOIN item_name_locale as l
      ON i.id = l.id;`, (err, rows, fields) => item_util_1.ItemUtil.handleItemsRequest(err, rows, res, db));
};
//# sourceMappingURL=item.controller.js.map