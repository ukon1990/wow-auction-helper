"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = __importStar(require("mysql"));
const request = __importStar(require("request"));
const RequestPromise = __importStar(require("request-promise"));
const PromiseThrottle = __importStar(require("promise-throttle"));
const locales_1 = require("../util/locales");
const string_util_1 = require("./string.util");
const item_1 = require("../models/item/item");
const secrets_1 = require("./secrets");
const wowhead_util_1 = require("./wowhead.util");
const item_locale_1 = require("../models/item/item-locale");
class ItemUtil {
    static handleItemRequest(id, error, items, response, request, db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (error) {
                db.end();
                response.send(new item_1.Item());
                return;
            }
            /*
                if (items.length > 0) {
                  db.end();
                  ItemUtil.handleItem(items[0]);
                  response.send(items[0]);
                  return;
                }*/
            let item;
            /*await ItemUtil.getItemFromBlizzard(id, request)
              .then(i => item = new Item(i))
              .catch(error => console.error(error));
            await ItemUtil.getWowDBData(id)
              .then((i: WoWDBItem) =>
                WoWDBItem.setItemWithWoWDBValues(i, item))
              .catch(error => console.error(error));*/
            let re = '';
            yield ItemUtil.getWowheadData(id, wowhead_util_1.WoWHeadUtil.setValuesAll)
                .then((id) => re = id) // item.expansionId = id
                .catch(error => console.error(error));
            response.send(re);
        });
    }
    static handleItemsRequest(error, items, response, db) {
        if (!error) {
            items.forEach(item => ItemUtil.handleItem);
        }
        db.end();
        response.send({
            items: items ? items : []
        });
    }
    static handleItem(item) {
        item.itemSource = item.itemSource === '[]' ?
            [] : JSON.parse(item.itemSource.replace(/[\n]/g, ''));
        // TODO: Fix some issues regarding this json in the DB - r.itemSpells
        item.itemSpells = item.itemSpells === '[]' ? [] : [];
    }
    static getWowheadData(id, action) {
        return new Promise((resolve, reject) => {
            request.get(`http://www.wowhead.com/item=${id}`, (whError, whResponse, whBody) => {
                if (whError) {
                    reject();
                }
                resolve(action(whBody));
            });
        });
    }
    static getWowDBData(id) {
        return new Promise((resolve, reject) => {
            request.get(`http://wowdb.com/api/item/${id}`, (error, response, body) => {
                if (error) {
                    reject();
                }
                resolve(JSON.parse(body.slice(1, body.length - 1)));
            });
        });
    }
    static getItemFromBlizzard(id, req) {
        return new Promise((resolve, reject) => {
            request.get(`https://eu.api.battle.net/wow/item/${id}?locale=${locales_1.getLocale(req)}&apikey=${secrets_1.BLIZZARD_API_KEY}`, (error, re, body) => {
                // const icon = JSON.parse(body).icon;
                if (error) {
                    reject();
                }
                resolve(JSON.parse(body));
            });
        });
    }
    static setMissingLocales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Limit to 9 per second
            return new Promise((resolve, reject) => {
                const db = mysql.createConnection(secrets_1.DATABASE_CREDENTIALS);
                db.query(`
        select id from items
        where id not in (select id from item_name_locale);`, (err, rows, fields) => __awaiter(this, void 0, void 0, function* () {
                    if (!err) {
                        const promiseThrottle = new PromiseThrottle({
                            requestsPerSecond: 1,
                            promiseImplementation: Promise
                        });
                        const list = [];
                        const itemIDs = [];
                        rows.forEach(row => {
                            itemIDs.push(promiseThrottle.add(() => {
                                return new Promise((resolve, reject) => {
                                    this.getItemLocale(row.id, req, res)
                                        .then(r => {
                                        list.push(r);
                                        resolve(r);
                                    })
                                        .catch(e => {
                                        console.error(e);
                                        reject({});
                                    });
                                });
                            }));
                        });
                        yield Promise.all(itemIDs)
                            .then(r => { })
                            .catch(e => console.error(e));
                        resolve(list);
                    }
                    else {
                        reject({});
                    }
                }));
            });
        });
    }
    static getItemLocale(itemID, req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const item = new item_locale_1.ItemLocale(itemID);
                const euPromises = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'it_IT', 'pl_PL', 'pt_PT', 'ru_RU']
                    .map(locale => RequestPromise.get(`https://eu.api.battle.net/wow/item/${itemID}?locale=${locale}&apikey=${secrets_1.BLIZZARD_API_KEY}`, (r, e, b) => ItemUtil.resolveLocaleResponse(item, locale, b))), usPromises = ['en_US', 'es_MX', 'pt_BR']
                    .map(locale => RequestPromise.get(`https://us.api.battle.net/wow/item/${itemID}?locale=${locale}&apikey=${secrets_1.BLIZZARD_API_KEY}`, (r, e, b) => ItemUtil.resolveLocaleResponse(item, locale, b)));
                yield Promise.all(euPromises).then(r => {
                }).catch(e => {
                    // console.error(e);
                });
                yield ItemUtil.doLocaleInsertQuery(item);
                return item;
            }));
        });
    }
    static resolveLocaleResponse(item, locale, b) {
        try {
            item[locale] = JSON.parse(b).name;
        }
        catch (e) {
            item[locale] = '404';
        }
    }
    static doLocaleInsertQuery(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const db = mysql.createConnection(secrets_1.DATABASE_CREDENTIALS), sql = `INSERT INTO item_name_locale
        (id, en_GB, en_US, de_DE, es_ES, es_MX, fr_FR, it_IT, pl_PL, pt_PT, pt_BR, ru_RU)
        VALUES
        (${item.id},
          "${string_util_1.safeifyString(item.en_GB)}",
          "${string_util_1.safeifyString(item.en_US)}",
          "${string_util_1.safeifyString(item.de_DE)}",
          "${string_util_1.safeifyString(item.es_ES)}",
          "${string_util_1.safeifyString(item.es_MX)}",
          "${string_util_1.safeifyString(item.fr_FR)}",
          "${string_util_1.safeifyString(item.it_IT)}",
          "${string_util_1.safeifyString(item.pl_PL)}",
          "${string_util_1.safeifyString(item.pt_PT)}",
          "${string_util_1.safeifyString(item.pt_BR)}",
          "${string_util_1.safeifyString(item.ru_RU)}");`;
                    db.query(sql, (err, rows, fields) => {
                        db.end();
                        if (!err) {
                            console.log(`Locale added to db for ${item.en_GB}`);
                            reject();
                        }
                        else {
                            console.error(`Locale not added to db for ${item.en_GB}`, err);
                            resolve(item);
                        }
                    });
                    //
                }
                catch (e) {
                    reject();
                }
            });
        });
    }
}
exports.ItemUtil = ItemUtil;
//# sourceMappingURL=item.util.js.map