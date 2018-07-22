"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Item {
    constructor(item) {
        this.name = "Missing item";
        this.icon = "inv_scroll_03";
        if (item) {
            this.id = item.id;
            this.name = item.name;
            this.icon = item.icon;
            this.itemLevel = item.itemLevel;
            this.itemClass = item.itemClass;
            this.itemSubClass = item.itemSubClass;
            this.quality = item.quality;
            this.buyPrice = item.buyPrice;
            this.sellPrice = item.sellPrice;
            this.itemBind = item.itemBind;
            this.minFactionId = item.minFactionId;
            this.minReputation = item.minReputation;
        }
    }
}
exports.Item = Item;
//# sourceMappingURL=item.js.map