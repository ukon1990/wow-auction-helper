"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
const watchlist_1 = require("../watchlist/watchlist");
const custom_price_1 = require("../crafting/custom-price");
const default_custom_prices_1 = require("../crafting/default-custom-prices");
const shopping_cart_1 = require("../shopping-cart");
const custom_proc_1 = require("../crafting/custom-proc");
const default_custom_procs_1 = require("../crafting/default-custom-procs");
class User {
    constructor() {
        this.character = '';
        this.characters = new Array();
        this.customPrices = default_custom_prices_1.customPricesDefault;
        this.customProcs = default_custom_procs_1.customProcsDefault;
        this.apiToUse = 'none';
        // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
        this.buyoutLimit = 200;
        this.useIntermediateCrafting = true;
        this.notifications = {
            isUpdateAvailable: true,
            isBelowVendorSell: true,
            isUndercut: true,
            isWatchlist: true
        };
        this.watchlist = new watchlist_1.Watchlist();
        this.shoppingCart = new shopping_cart_1.ShoppingCart();
        this.isDarkMode = true;
    }
    /**
     *
     * @param object JSON string exported from the application
     */
    static import(object) {
        this.save(JSON.parse(object));
    }
    static save(user) {
        if (!shared_service_1.SharedService.user) {
            shared_service_1.SharedService.user = new User();
        }
        if (!user) {
            user = shared_service_1.SharedService.user;
        }
        Object.keys(user).forEach(key => {
            switch (key) {
                case 'region':
                    localStorage['region'] = user[key];
                    shared_service_1.SharedService.user.region = user[key];
                    break;
                case 'realm':
                    localStorage['realm'] = user[key];
                    shared_service_1.SharedService.user.realm = user[key];
                    break;
                case 'character':
                    localStorage['character'] = user[key];
                    shared_service_1.SharedService.user.character = user[key];
                    break;
                case 'apiTsm':
                    localStorage['api_tsm'] = user[key];
                    shared_service_1.SharedService.user.apiTsm = user[key];
                    break;
                case 'apiWoWu':
                    localStorage['api_wowuction'] = user[key];
                    shared_service_1.SharedService.user.apiWoWu = user[key];
                    break;
                case 'customPrices':
                    localStorage['custom_prices'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.customPrices = user[key];
                    break;
                case 'customProcs':
                    localStorage['custom_procs'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.customProcs = user[key];
                    break;
                case 'apiToUse':
                    localStorage['api_to_use'] = user[key];
                    shared_service_1.SharedService.user.apiToUse = user[key];
                    break;
                case 'buyoutLimit':
                    localStorage['crafting_buyout_limit'] = user[key];
                    shared_service_1.SharedService.user.buyoutLimit = user[key];
                    break;
                case 'characters':
                    localStorage['characters'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.characters = user[key];
                    break;
                case 'useIntermediateCrafting':
                    localStorage['use_intermediate_crafting'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.useIntermediateCrafting = user[key];
                    break;
                case 'notifications':
                    localStorage['notifications'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.notifications = user[key];
                    break;
                case 'isDarkMode':
                    localStorage['isDarkMode'] = JSON.stringify(user[key]);
                    shared_service_1.SharedService.user.isDarkMode = user[key];
                    break; /*
              case 'watchlist':
                localStorage[key] = JSON.stringify({ groups: SharedService.user.watchlist.groups });
                SharedService.user.watchlist = new Watchlist();
                break;*/
            }
        });
        if (user.realm && user.region) {
            this.updateRecipesForRealm();
        }
    }
    static restore() {
        shared_service_1.SharedService.user = User.getSettings();
        if (shared_service_1.SharedService.user.realm && shared_service_1.SharedService.user.region) {
            this.updateRecipesForRealm();
        }
    }
    static delete() {
        delete localStorage['region'];
        delete localStorage['realm'];
        delete localStorage['character'];
        delete localStorage['api_tsm'];
        delete localStorage['api_wowuction'];
        delete localStorage['api_to_use'];
        delete localStorage['crafting_buyout_limit'];
        delete localStorage['crafters'];
        delete localStorage['crafters_recipes'];
        delete localStorage['watchlist'];
        delete localStorage['notifications'];
        // lists.myRecipes = [];
        shared_service_1.SharedService.user = new User();
    }
    static getSettings(isExport) {
        const user = new User();
        Object.keys(localStorage).forEach(key => {
            switch (key) {
                case 'region':
                    user.region = localStorage[key];
                    break;
                case 'realm':
                    user.realm = localStorage[key];
                    break;
                case 'character':
                    user.character = localStorage[key];
                    break;
                case 'api_tsm':
                    user.apiTsm = localStorage[key];
                    break;
                case 'api_wowuction':
                    user.apiWoWu = localStorage[key];
                    break;
                case 'custom_prices':
                    const cp = JSON.parse(localStorage[key]);
                    if (cp instanceof Array) {
                        user.customPrices = cp;
                    }
                    else {
                        user.customPrices = custom_price_1.CustomPrices.convertFromOldVersion(cp);
                    }
                    custom_price_1.CustomPrices.createMap(user.customPrices);
                    break;
                case 'custom_procs':
                    user.customProcs = JSON.parse(localStorage[key]);
                    custom_proc_1.CustomProcs.createMap(user.customProcs);
                    break;
                case 'api_to_use':
                    user.apiToUse = localStorage[key];
                    break;
                case 'crafting_buyout_limit':
                    user.buyoutLimit = parseFloat(localStorage[key]);
                    break;
                case 'characters':
                    user.characters = JSON.parse(localStorage[key]);
                    break;
                case 'useIntermediateCrafting':
                    user.useIntermediateCrafting = JSON.parse(localStorage[key]);
                    break;
                case 'notifications':
                    user.notifications = JSON.parse(localStorage[key]);
                    break;
                case 'isDarkMode':
                    user.isDarkMode = JSON.parse(localStorage[key]);
                    break;
                case 'watchlist':
                    if (isExport) {
                        user.watchlist = JSON.parse(localStorage[key]);
                    }
                    break;
            }
        });
        if (user.customProcs.length === 0) {
            user.customProcs = default_custom_procs_1.customProcsDefault;
        }
        return user;
    }
    /**
     * Grouping the current recipes for a user
     */
    static updateRecipesForRealm() {
        shared_service_1.SharedService.recipesForUser = new Map();
        shared_service_1.SharedService.user.characters.forEach(character => {
            this.setRecipesForCharacter(character);
        });
    }
    static setRecipesForCharacter(character) {
        if (character && character.professions &&
            shared_service_1.SharedService.user.realm.toLowerCase() === User.slugifyString(character.realm)) {
            character.professions.primary.forEach(primary => {
                primary.recipes.forEach(recipe => {
                    User.addRecipe(recipe, character.name);
                });
            });
            character.professions.secondary.forEach(secondary => {
                secondary.recipes.forEach(recipe => {
                    User.addRecipe(recipe, character.name);
                });
            });
        }
    }
    static addRecipe(spellId, characterName) {
        if (!shared_service_1.SharedService.recipesForUser[spellId]) {
            shared_service_1.SharedService.recipesForUser[spellId] = new Array();
        }
        shared_service_1.SharedService.recipesForUser[spellId].push(characterName);
    }
    static slugifyString(realm) {
        return realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase();
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map