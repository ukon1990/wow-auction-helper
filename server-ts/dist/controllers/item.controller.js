"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.getItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const db = mysql_1.default.createConnection(secrets_1.DATABASE_CREDENTIALS);
    db.query(`
    SELECT i.id, COALESCE(${locales_1.getLocale(req)}, i.name) as name, icon, itemLevel, itemClass, itemSubClass, quality, itemSpells, itemSource, buyPrice, sellPrice, itemBind, minFactionId, minReputation, isDropped, expansionId
    FROM items as i
    LEFT OUTER JOIN item_name_locale as l
    ON i.id = l.id
    WHERE i.id = ${req.params.id};`, (err, rows, fields) => item_util_1.ItemUtil.handleItemRequest(req.params.id, err, rows, res, req, db));
});
//# sourceMappingURL=item.controller.js.map