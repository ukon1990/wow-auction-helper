"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
class CustomPrices {
    static add(item) {
        if (!shared_service_1.SharedService.customPricesMap[item.id]) {
            const customPrice = new CustomPrice(item);
            shared_service_1.SharedService.customPricesMap[item.id] = customPrice;
            shared_service_1.SharedService.user.customPrices.push(customPrice);
            CustomPrices.save();
        }
    }
    static remove(customPrice, index) {
        shared_service_1.SharedService.user.customPrices.splice(index, 1);
        delete shared_service_1.SharedService.customPricesMap[customPrice.itemID];
        CustomPrices.save();
    }
    static createMap(customPrices) {
        customPrices.forEach(c => shared_service_1.SharedService.customPricesMap[c.itemID] = c);
    }
    static convertFromOldVersion(customPrice) {
        const cp = new Array();
        Object.keys(customPrice).forEach(key => {
            cp.push({ itemID: parseInt(key, 10), name: undefined, price: customPrice[key] });
        });
        return cp;
    }
    static save() {
        localStorage['custom_prices'] = JSON.stringify(shared_service_1.SharedService.user.customPrices);
    }
}
exports.CustomPrices = CustomPrices;
class CustomPrice {
    constructor(item) {
        if (item) {
            this.itemID = item.id;
            this.name = item.name;
            this.price = 0;
        }
    }
}
exports.CustomPrice = CustomPrice;
//# sourceMappingURL=custom-price.js.map