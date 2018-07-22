"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WoWDBItem {
    static setItemWithWoWDBValues(wowDBItem, item) {
        item.itemSpells = wowDBItem.Spells ? wowDBItem.Spells : [];
        item.itemSource = wowDBItem.DroppedBy ? wowDBItem.DroppedBy : [];
        item.minReputation = parseInt(wowDBItem.RequiredFactionStanding, 10);
        item.isDropped = wowDBItem.DroppedBy ? wowDBItem.DroppedBy.length > 0 : false;
    }
}
exports.WoWDBItem = WoWDBItem;
class NPC {
}
exports.NPC = NPC;
class ItemBonus {
}
//# sourceMappingURL=wowdb.js.map