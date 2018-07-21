"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../services/shared.service");
const gold_pipe_1 = require("../pipes/gold.pipe");
const custom_proc_1 = require("./crafting/custom-proc");
/**
 * Local storage value: shopping_cart
 */
class ShoppingCart {
    constructor() {
        this.pipe = new gold_pipe_1.GoldPipe();
        this.tsmShoppingString = '';
        this.recipes = new Array();
        this.recipesMap = new Map();
        this.reagents = new Array();
        this.reagentsMap = new Map();
        this.items = new Array();
        this.itemsMap = new Map();
        this.cost = 0;
        this.buyout = 0;
        this.profit = 0;
    }
    // TODO: Add shopping cart cost calc strategies
    addEntry(quantity, recipe, item, asSubmat) {
        for (let i = 0; i < quantity; i++) {
            if (recipe) {
                if (this.recipesMap[recipe.spellID]) {
                    this.recipesMap[recipe.spellID].quantity++;
                    recipe.reagents.forEach(r => {
                        if (this.reagentsMap[r.itemID]) {
                            if (this.useIntermediate(r.itemID)) {
                                const iC = shared_service_1.SharedService.recipesMapPerItemKnown[r.itemID];
                                this.addEntry(r.count / custom_proc_1.CustomProcs.get(iC), iC, undefined, true);
                                this.recipesMap[recipe.spellID].intermediate += r.count / custom_proc_1.CustomProcs.get(recipe);
                                this.recipesMap[iC.spellID].intermediateCount += quantity * r.count / custom_proc_1.CustomProcs.get(recipe);
                            }
                            else {
                                this.reagentsMap[r.itemID].quantity += r.count;
                            }
                        }
                        else {
                            this.reagentsMap[r.itemID] = new ShoppingCartReagent(r.itemID, r.count);
                            this.reagents.push(this.reagentsMap[r.itemID]);
                        }
                    });
                }
                else {
                    this.recipesMap[recipe.spellID] = new ShoppingCartRecipe(recipe.spellID, recipe.itemID);
                    this.recipes.push(this.recipesMap[recipe.spellID]);
                    recipe.reagents.forEach(r => {
                        if (this.useIntermediate(r.itemID)) {
                            const iC = shared_service_1.SharedService.recipesMapPerItemKnown[r.itemID];
                            this.addEntry(r.count / custom_proc_1.CustomProcs.get(iC), iC, undefined, true);
                            this.recipesMap[iC.spellID].intermediateCount += quantity * r.count / custom_proc_1.CustomProcs.get(recipe);
                        }
                        else {
                            this.addReagent(r.itemID, r.count / custom_proc_1.CustomProcs.get(recipe), recipe, asSubmat);
                        }
                    });
                }
            }
            else if (item) {
                if (this.itemsMap[item.itemID]) {
                    this.itemsMap[item.itemID].quantity++;
                }
                else {
                    this.itemsMap[item.itemID] = new ShoppingCartItem(item.itemID);
                }
            }
        }
        if (!asSubmat) {
            this.calculateCartCost();
            this.save();
        }
    }
    addReagent(itemID, count, recipe, asSubmat) {
        if (this.reagentsMap[itemID]) {
            this.reagentsMap[itemID].quantity += count;
        }
        else {
            this.reagentsMap[itemID] = new ShoppingCartReagent(itemID, count);
            this.reagents.push(this.reagentsMap[itemID]);
        }
        this.recipesMap[recipe.spellID]
            .reagents.push(new ShoppingCartReagent(itemID, count));
    }
    getRecipeForItem(itemID) {
        return (shared_service_1.SharedService.recipesMapPerItemKnown[itemID] && shared_service_1.SharedService.auctionItemsMap[itemID] &&
            shared_service_1.SharedService.recipesMapPerItemKnown[itemID].cost < shared_service_1.SharedService.auctionItemsMap[itemID].buyout) ||
            shared_service_1.SharedService.recipesMapPerItemKnown[itemID] && !shared_service_1.SharedService.auctionItemsMap[itemID];
    }
    calculateCartCost() {
        this.buyout = 0;
        this.cost = 0;
        this.profit = 0;
        if (shared_service_1.SharedService.recipes.length === 0 || shared_service_1.SharedService.auctionItems.length === 0) {
            return;
        }
        this.reagents.forEach(reagent => {
            if (shared_service_1.SharedService.auctionItemsMap[reagent.itemID]) {
                this.cost += shared_service_1.SharedService.auctionItemsMap[reagent.itemID].buyout * reagent.quantity;
            }
        });
        this.recipes.forEach(recipe => {
            if (shared_service_1.SharedService.recipesMap[recipe.spellID] && shared_service_1.SharedService.recipesMap[recipe.spellID].buyout) {
                this.buyout += shared_service_1.SharedService.recipesMap[recipe.spellID].buyout * (recipe.quantity - recipe.intermediateCount);
            }
        });
        this.profit = this.buyout - this.cost;
        this.setShoppingString();
    }
    restore() {
        let lsObject;
        if (localStorage['shopping_cart']) {
            lsObject = JSON.parse(localStorage['shopping_cart']);
            if (!lsObject) {
                return;
            }
            if (lsObject.cost) {
                delete localStorage['shopping_cart'];
            }
            else {
                if (lsObject.reagents) {
                    this.reagents = lsObject.reagents;
                    this.reagents.forEach(r => {
                        this.reagentsMap[r.itemID] = r;
                    });
                }
                if (lsObject.recipes) {
                    this.recipes = lsObject.recipes;
                    this.recipes.forEach(r => {
                        this.recipesMap[r.spellID] = r;
                    });
                }
                if (lsObject.items) {
                    this.items = lsObject.items;
                    this.items.forEach(i => {
                        this.itemsMap[i.itemID] = i;
                    });
                }
                this.calculateCartCost();
            }
        }
    }
    clear() {
        this.recipes = new Array();
        this.recipesMap = new Map();
        this.reagents = new Array();
        this.reagentsMap = new Map();
        this.items = new Array();
        this.itemsMap = new Map();
        this.save();
        this.setShoppingString();
    }
    save() {
        localStorage['shopping_cart'] =
            JSON.stringify({ recipes: this.recipes, reagents: this.reagents, items: this.items });
    }
    useIntermediate(itemID) {
        return this.useIntermediateCrafting() && this.getRecipeForItem(itemID) ? true : false;
    }
    removeRecipe(recipe, index) {
        recipe.reagents.forEach(r => {
            this.removeReagent(recipe, r);
        });
        this.recipes.splice(index, 1);
        delete this.recipesMap[recipe.spellID];
        this.calculateCartCost();
        this.save();
    }
    removeReagent(recipe, reagent) {
        const minCount = custom_proc_1.CustomProcs.get(shared_service_1.SharedService.recipesMap[recipe.spellID]);
        this.reagents.forEach((r, i) => {
            if (r.itemID === reagent.itemID) {
                r.quantity -= (reagent.quantity * recipe.quantity) / minCount;
                if (r.quantity >= 0) {
                    this.reagents.splice(i, 1);
                    delete this.reagentsMap[reagent.itemID];
                }
            }
        });
    }
    useIntermediateCrafting() {
        return shared_service_1.SharedService.user && shared_service_1.SharedService.user.useIntermediateCrafting;
    }
    setShoppingString() {
        this.tsmShoppingString = '';
        let item;
        this.reagents.forEach(r => {
            item = shared_service_1.SharedService.auctionItemsMap[r.itemID];
            if (item) {
                this.tsmShoppingString += `${item.name}/exact/x${Math.ceil(r.quantity)};`;
            }
        });
        if (this.tsmShoppingString.length > 0 && this.tsmShoppingString.endsWith(';')) {
            this.tsmShoppingString = this.tsmShoppingString.slice(0, this.tsmShoppingString.length - 1);
        }
    }
}
exports.ShoppingCart = ShoppingCart;
class ShoppingCartRecipe {
    constructor(spellID, itemID) {
        this.quantity = 1;
        this.intermediateCount = 0;
        this.reagents = Array();
        this.spellID = spellID;
        this.itemID = itemID;
    }
}
exports.ShoppingCartRecipe = ShoppingCartRecipe;
class ShoppingCartReagent {
    constructor(itemID, quantity) {
        this.intermediateCount = 0;
        this.itemID = itemID;
        this.quantity = quantity;
    }
}
exports.ShoppingCartReagent = ShoppingCartReagent;
class ShoppingCartItem {
    constructor(itemID) {
        this.quantity = 1;
        this.itemID = itemID;
    }
}
exports.ShoppingCartItem = ShoppingCartItem;
//# sourceMappingURL=shopping-cart.js.map