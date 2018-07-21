"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
const custom_proc_1 = require("./custom-proc");
class Crafting {
    static checkForMissingRecipes(craftingService) {
        const missingRecipes = [];
        Object.keys(shared_service_1.SharedService.recipesForUser).forEach(key => {
            try {
                if (!shared_service_1.SharedService.recipesMap[key]) {
                    missingRecipes.push(parseInt(key, 10));
                }
            }
            catch (e) {
                console.error('checkForMissingRecipes failed', e);
            }
        });
        if (missingRecipes.length > 100) {
            craftingService.addRecipes(missingRecipes);
        }
    }
    static calculateCost() {
        Object.keys(shared_service_1.SharedService.itemRecipeMap).forEach(key => {
            shared_service_1.SharedService.itemRecipeMap[key].length = 0;
        });
        shared_service_1.SharedService.recipes
            .forEach(r => this.costForRecipe(r));
    }
    static costForRecipe(recipe) {
        if (recipe === null || recipe === undefined) {
            return;
        }
        try {
            recipe.cost = 0;
            recipe.roi = 0;
            if (shared_service_1.SharedService.auctionItemsMap[recipe.itemID]) {
                recipe.mktPrice = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].mktPrice;
                recipe.buyout = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].buyout;
                recipe.avgDailySold = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].avgDailySold;
                recipe.regionSaleRate = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].regionSaleRate;
                recipe.quantityTotal = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].quantityTotal;
                recipe.regionSaleAvg = shared_service_1.SharedService.auctionItemsMap[recipe.itemID].regionSaleAvg;
            }
            recipe.reagents.forEach(r => {
                // If this is a intermediate craft
                if (shared_service_1.SharedService.user.useIntermediateCrafting &&
                    shared_service_1.SharedService.recipesMapPerItemKnown[r.itemID]) {
                    const re = shared_service_1.SharedService.recipesMapPerItemKnown[r.itemID];
                    if (re.reagents.length > 0) {
                        re.reagents.forEach(rea => {
                            recipe.cost += this.getCost(rea.itemID, rea.count) / custom_proc_1.CustomProcs.get(re) * r.count;
                        });
                    }
                }
                else {
                    recipe.cost += this.getCost(r.itemID, r.count) / custom_proc_1.CustomProcs.get(recipe);
                }
            });
            recipe.roi = this.getROI(recipe.cost, shared_service_1.SharedService.auctionItemsMap[recipe.itemID]);
        }
        catch (e) {
            console.error('Calc issue with recipe', e, recipe);
        }
        if (!shared_service_1.SharedService.itemRecipeMap[recipe.itemID]) {
            shared_service_1.SharedService.itemRecipeMap[recipe.itemID] = new Array();
        }
        shared_service_1.SharedService.itemRecipeMap[recipe.itemID].push(recipe);
        // The user should see item combination items as "known"
        if (recipe.profession === 'none') {
            shared_service_1.SharedService.recipesForUser[recipe.spellID] = ['Item'];
        }
        // For intermediate crafting
        if (shared_service_1.SharedService.recipesForUser[recipe.spellID]) {
            if (!shared_service_1.SharedService.recipesMapPerItemKnown[recipe.itemID] || shared_service_1.SharedService.recipesMapPerItemKnown[recipe.itemID].cost > recipe.cost) {
                shared_service_1.SharedService.recipesMapPerItemKnown[recipe.itemID] = recipe;
            }
        }
    }
    static getCost(itemID, count) {
        if (shared_service_1.SharedService.customPricesMap && shared_service_1.SharedService.customPricesMap[itemID]) {
            return (shared_service_1.SharedService.customPricesMap[itemID].price * count);
        }
        else if (shared_service_1.SharedService.tradeVendorItemMap[itemID] && shared_service_1.SharedService.tradeVendorMap[itemID].useForCrafting) {
            return (shared_service_1.SharedService.tradeVendorItemMap[itemID].value * count);
        }
        else if (shared_service_1.SharedService.auctionItemsMap[itemID] && !Crafting.isBelowMktBuyoutValue(itemID)) {
            return shared_service_1.SharedService.auctionItemsMap[itemID].buyout * count;
        }
        else if (Crafting.existsInTSM(itemID)) {
            // Using the tsm list, so that we can get mktPrice if an item is not @ AH
            return (shared_service_1.SharedService.tsm[itemID].MarketValue * count);
        }
        return 0;
    }
    /*
    public static getReagentCraftCost(itemID: number, count: number): number {
      return
    }*/
    static existsInTSM(itemID) {
        return shared_service_1.SharedService.user.apiToUse !== 'none' && shared_service_1.SharedService.tsm[itemID];
    }
    static isBelowMktBuyoutValue(itemID) {
        return Crafting.existsInTSM(itemID) && shared_service_1.SharedService.auctionItemsMap[itemID].buyout /
            shared_service_1.SharedService.tsm[itemID].MarketValue * 100 >=
            shared_service_1.SharedService.user.buyoutLimit;
    }
    static getROI(cost, item) {
        if (!item) {
            return 0;
        }
        return item.buyout - cost;
    }
}
exports.Crafting = Crafting;
//# sourceMappingURL=crafting.js.map