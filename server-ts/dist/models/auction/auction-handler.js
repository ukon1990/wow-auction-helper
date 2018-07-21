"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("./../../services/shared.service");
const auction_item_1 = require("./auction-item");
const crafting_1 = require("../crafting/crafting");
const dashboard_1 = require("../dashboard");
const trade_vendors_1 = require("../item/trade-vendors");
const seller_1 = require("../seller");
const auction_pet_1 = require("./auction-pet");
class AuctionHandler {
    /**
      * Organizes the auctions into groups of auctions per item
      * Used in the auction service.
      * @param auctions A raw auction array
      */
    static organize(auctions, petService) {
        shared_service_1.SharedService.auctionItems.length = 0;
        Object.keys(shared_service_1.SharedService.auctionItemsMap)
            .forEach(key => {
            delete shared_service_1.SharedService.auctionItemsMap[key];
        });
        shared_service_1.SharedService.userAuctions.organizeCharacters(shared_service_1.SharedService.user.characters);
        // Sorting by buyout, before we do the grouping for less processing.
        auctions.sort((a, b) => {
            return a.buyout / a.quantity - b.buyout / b.quantity;
        });
        shared_service_1.SharedService.auctions = auctions;
        auctions.forEach(a => {
            if (a.petSpeciesId && !shared_service_1.SharedService.auctionItemsMap[`${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`]) {
                const petId = `${a.item}-${a.petSpeciesId}-${a.petLevel}-${a.petQualityId}`;
                shared_service_1.SharedService.auctionItemsMap[petId] = this.newAuctionItem(a);
                shared_service_1.SharedService.auctionItems.push(shared_service_1.SharedService.auctionItemsMap[petId]);
                if (!shared_service_1.SharedService.pets[a.petSpeciesId] && petService) {
                    console.log('Attempting to add pet');
                    petService.getPet(a.petSpeciesId).then(p => {
                        AuctionHandler.getItemName(a);
                        console.log('Fetched pet', shared_service_1.SharedService.pets[a.petSpeciesId]);
                    });
                }
                else {
                    if (!shared_service_1.SharedService.pets[a.petSpeciesId].auctions) {
                        shared_service_1.SharedService.pets[a.petSpeciesId].auctions = new Array();
                    }
                    shared_service_1.SharedService.pets[a.petSpeciesId].auctions.push(shared_service_1.SharedService.auctionItemsMap[petId]);
                }
            }
            else if (!shared_service_1.SharedService.auctionItemsMap[a.item]) {
                shared_service_1.SharedService.auctionItemsMap[a.item] = this.newAuctionItem(a);
                shared_service_1.SharedService.auctionItems.push(shared_service_1.SharedService.auctionItemsMap[a.item]);
            }
            else {
                AuctionHandler.updateAuctionItem(a);
            }
            shared_service_1.SharedService.userAuctions.addAuction(a);
        });
        // Checking if we have been undercutted etc
        shared_service_1.SharedService.userAuctions.countUndercuttedAuctions(shared_service_1.SharedService.auctionItemsMap);
        setTimeout(() => {
            // Trade vendors has to be done before crafting calc
            trade_vendors_1.TradeVendors.setValues();
            crafting_1.Crafting.calculateCost();
            // Grouping auctions by seller
            seller_1.Seller.organize();
            // Dashboard -> Needs to be done after trade vendors
            dashboard_1.Dashboard.addDashboards();
            shared_service_1.SharedService.user.shoppingCart.restore();
            shared_service_1.SharedService.user.shoppingCart.calculateCartCost();
            shared_service_1.SharedService.userAuctions.auctions.forEach(auc => {
                auc.undercutByAmount = auc.buyout / auc.quantity - shared_service_1.SharedService.auctionItemsMap[auc.item].buyout;
            });
            console.log(shared_service_1.SharedService.userAuctions.auctions);
        }, 100);
    }
    static auctionPriceHandler() {
        return null;
    }
    static getItemName(auction) {
        if (auction.petSpeciesId) {
            if (shared_service_1.SharedService.pets[auction.petSpeciesId]) {
                return `${shared_service_1.SharedService.pets[auction.petSpeciesId].name} - Level ${auction.petLevel} - Quality ${auction.petQualityId}`;
            }
            return 'Pet name missing';
        }
        return shared_service_1.SharedService.items[auction.item] ?
            shared_service_1.SharedService.items[auction.item].name : 'Item name missing';
    }
    static updateAuctionItem(auction) {
        /* TODO: Should this, or should it not be excluded?
        if (auction.buyout === 0) {
          return;
        }*/
        const id = auction.petSpeciesId ?
            new auction_pet_1.AuctionPet(auction.petSpeciesId, auction.petLevel, auction.petQualityId).auctionId : auction.item, ai = shared_service_1.SharedService.auctionItemsMap[id];
        if (ai.buyout === 0 || (ai.buyout > auction.buyout && auction.buyout > 0)) {
            ai.owner = auction.owner;
            ai.buyout = auction.buyout / auction.quantity;
            ai.bid = auction.bid / auction.quantity;
        }
        ai.quantityTotal += auction.quantity;
        ai.auctions.push(auction);
    }
    static newAuctionItem(auction) {
        const tmpAuc = new auction_item_1.AuctionItem();
        tmpAuc.itemID = auction.item;
        tmpAuc.petSpeciesId = auction.petSpeciesId;
        tmpAuc.petLevel = auction.petLevel;
        tmpAuc.petQualityId = auction.petQualityId;
        tmpAuc.name = AuctionHandler.getItemName(auction);
        tmpAuc.owner = auction.owner;
        tmpAuc.ownerRealm = auction.ownerRealm;
        tmpAuc.buyout = auction.buyout / auction.quantity;
        tmpAuc.bid = auction.bid / auction.quantity;
        tmpAuc.quantityTotal += auction.quantity;
        tmpAuc.vendorSell = shared_service_1.SharedService.items[tmpAuc.itemID] ? shared_service_1.SharedService.items[tmpAuc.itemID].sellPrice : 0;
        tmpAuc.auctions.push(auction);
        if (this.useTSM() && shared_service_1.SharedService.tsm[auction.item]) {
            const tsmItem = shared_service_1.SharedService.tsm[auction.item];
            tmpAuc.regionSaleRate = tsmItem.RegionSaleRate;
            tmpAuc.mktPrice = tsmItem.MarketValue;
            tmpAuc.avgDailySold = tsmItem.RegionAvgDailySold;
            tmpAuc.regionSaleAvg = tsmItem.RegionSaleAvg;
        }
        else if (this.useWoWUction() && shared_service_1.SharedService.wowUction[auction.item]) {
            const wowuItem = shared_service_1.SharedService.wowUction[auction.item];
            tmpAuc.regionSaleRate = wowuItem.estDemand;
            tmpAuc.mktPrice = wowuItem.mktPrice;
            tmpAuc.avgDailySold = wowuItem.avgDailySold;
            tmpAuc.avgDailyPosted = wowuItem.avgDailyPosted;
        }
        return tmpAuc;
    }
    static useTSM() {
        return shared_service_1.SharedService.user.apiToUse === 'tsm';
    }
    static useWoWUction() {
        return shared_service_1.SharedService.user.apiToUse === 'wowuction';
    }
}
exports.AuctionHandler = AuctionHandler;
//# sourceMappingURL=auction-handler.js.map