"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
class Sorter {
    constructor() {
        this.auctionDuration = {
            'VERY_LONG': 4,
            'LONG': 3,
            'MEDIUM': 2,
            'SHORT': 1
        };
        this.keys = [];
    }
    addKey(key, divideByQuantity) {
        if (this.findKeyIndex(key) > -1) {
            this.getKey(key).divideByQuantity = divideByQuantity ? divideByQuantity : false;
            this.getKey(key).desc = !this.getKey(key).desc;
        }
        else {
            this.keys = [];
            this.keys.push(new Key(key, true, divideByQuantity ? divideByQuantity : false));
        }
    }
    sort(arr, customSort) {
        if (customSort) {
            customSort(arr);
            return;
        }
        arr.sort((a, b) => {
            for (let i = this.keys.length - 1; i >= 0; i--) {
                if (this.getItemToSort(this.keys[i], a) === this.getItemToSort(this.keys[i], b)) {
                    continue;
                }
                if (this.keys[i].desc) {
                    if (this.isString(a, i)) {
                        return this.getItemToSort(this.keys[i], b).localeCompare(this.getItemToSort(this.keys[i], a));
                    }
                    else {
                        return this.getItemToSort(this.keys[i], a) - this.getItemToSort(this.keys[i], b);
                    }
                }
                else {
                    if (this.isString(a, i)) {
                        return this.getItemToSort(this.keys[i], a).localeCompare(this.getItemToSort(this.keys[i], b));
                    }
                    else {
                        return this.getItemToSort(this.keys[i], b) - this.getItemToSort(this.keys[i], a);
                    }
                }
            }
            return 0;
        });
    }
    getItemToSort(key, item) {
        if (key.key === 'timeLeft') {
            return this.auctionDuration[item[key.key]];
        }
        else if (key.byPercent) {
            return item[key.key] ?
                item[key.key] : this.getAuctionItem(item) ?
                this.getAuctionItem(item)[key.key] / this.getAuctionItem(item)[key.percentOf] : false;
        }
        else {
            if (key.divideByQuantity) {
                return item[key.key] ?
                    item[key.key] / item.quantity : this.getAuctionItem(item) ?
                    this.getAuctionItem(item)[key.key] / this.getAuctionItem(item).quantity : false;
            }
            else {
                return item[key.key] ?
                    item[key.key] : this.getAuctionItem(item) ?
                    this.getAuctionItem(item)[key.key] : false;
            }
        }
    }
    getAuctionItem(item) {
        return shared_service_1.SharedService.auctionItemsMap[item.item ? item.item : item.itemID];
    }
    isString(object, index) {
        return typeof this.getItemToSort(this.keys[index], object) === 'string';
    }
    removeKey(key) {
        // Logic
    }
    findKeyIndex(key) {
        for (let i = 0, x = this.keys.length; i < x; i++) {
            if (key === this.keys[i].key) {
                return i;
            }
        }
        return -1;
    }
    getKey(key) {
        return this.keys[this.findKeyIndex(key)];
    }
}
exports.Sorter = Sorter;
class Key {
    constructor(key, desc, divideByQuantity, byPercent, percentOf) {
        this.key = key;
        this.desc = desc;
        this.divideByQuantity = divideByQuantity;
        this.byPercent = byPercent;
        this.percentOf = percentOf;
    }
}
exports.Key = Key;
//# sourceMappingURL=sorter.js.map