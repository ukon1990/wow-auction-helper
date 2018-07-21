"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
const item_classes_1 = require("./item/item-classes");
class Seller {
    constructor(name, realm, liquidity, volume, auction) {
        this.numOfAuctions = 1;
        this.auctions = new Array();
        this.name = name;
        this.realm = realm;
        this.liquidity = liquidity;
        this.volume = volume;
        this.auctions.push(auction);
    }
    static organize() {
        let id;
        Object.keys(shared_service_1.SharedService.sellersMap)
            .forEach(key => {
            delete shared_service_1.SharedService.sellersMap[key];
        });
        Object.keys(shared_service_1.SharedService.sellersByItemClassesMap)
            .forEach(key => {
            delete shared_service_1.SharedService.sellersByItemClassesMap[key];
        });
        shared_service_1.SharedService.sellers.length = 0;
        shared_service_1.SharedService.sellersByItemClass.length = 0;
        shared_service_1.SharedService.auctions.forEach(a => {
            if (!shared_service_1.SharedService.items[a.item]) {
                console.log(a.item);
                return;
            }
            id = shared_service_1.SharedService.items[a.item].itemClass;
            if (!shared_service_1.SharedService.sellersMap[a.owner]) {
                shared_service_1.SharedService.sellersMap[a.owner] = new Seller(a.owner, a.ownerRealm, a.buyout, a.quantity, a);
                shared_service_1.SharedService.sellers.push(shared_service_1.SharedService.sellersMap[a.owner]);
            }
            else {
                shared_service_1.SharedService.sellersMap[a.owner].liquidity += a.buyout;
                shared_service_1.SharedService.sellersMap[a.owner].volume += a.quantity;
                shared_service_1.SharedService.sellersMap[a.owner].numOfAuctions++;
                shared_service_1.SharedService.sellersMap[a.owner].auctions.push(a);
            }
            // If none exist
            if (!shared_service_1.SharedService.sellersByItemClassesMap[id]) {
                shared_service_1.SharedService.sellersByItemClassesMap[id] = new Map();
                shared_service_1.SharedService.sellersByItemClassesMap[id] = new ItemClassGroup(a);
            }
            else {
                shared_service_1.SharedService.sellersByItemClassesMap[id].add(a);
            }
        });
        item_classes_1.itemClasses.classes.forEach(c => {
            if (shared_service_1.SharedService.sellersByItemClassesMap[c.class]) {
                shared_service_1.SharedService.sellersByItemClassesMap[c.class].name = c.name;
                shared_service_1.SharedService.sellersByItemClass.push(shared_service_1.SharedService.sellersByItemClassesMap[c.class]);
            }
        });
    }
}
exports.Seller = Seller;
/**
 * Bad pracise. but it will remain here until I come up with a better way of solving this without having to iterate over the auctions again
 */
class ItemClassGroup {
    constructor(auction) {
        this.name = '';
        this.sellersMap = new Map();
        this.sellers = new Array();
        this.auctions = new Array();
        this.id = shared_service_1.SharedService.items[auction.item].itemClass;
        this.add(auction);
    }
    add(auction) {
        if (!this.sellersMap[auction.owner]) {
            this.sellersMap[auction.owner] = new Seller(auction.owner, auction.ownerRealm, auction.buyout, auction.quantity, auction);
            this.sellers.push(this.sellersMap[auction.owner]);
        }
        else {
            this.sellersMap[auction.owner].liquidity += auction.buyout;
            this.sellersMap[auction.owner].volume += auction.quantity;
            this.sellersMap[auction.owner].numOfAuctions++;
            this.sellersMap[auction.owner].auctions.push(auction);
        }
    }
}
exports.ItemClassGroup = ItemClassGroup;
//# sourceMappingURL=seller.js.map