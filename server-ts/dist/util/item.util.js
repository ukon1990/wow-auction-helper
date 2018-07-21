"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ItemUtil {
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
        item.itemSource = item.itemSource === "[]" ?
            [] : JSON.parse(item.itemSource.replace(/[\n]/g, ""));
        // TODO: Fix some issues regarding this json in the DB - r.itemSpells
        item.itemSpells = item.itemSpells === "[]" ? [] : [];
    }
}
exports.ItemUtil = ItemUtil;
//# sourceMappingURL=item.util.js.map