"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../user/user");
const custom_price_1 = require("./custom-price");
beforeEach(() => {
    user_1.User.restore();
});
describe('CustomPrices', () => {
    it('Should be able to convert the old version to the new one', () => {
        const cp = new custom_price_1.CustomPrice();
        const cpArr = new Array();
        const oldCP = { '115524': 200000, '120945': 500000, '124124': 3000000, '151568': 3000000 };
        cpArr.push(cp);
        cpArr.push(cp);
        cpArr.push(cp);
        expect(cp instanceof custom_price_1.CustomPrice).toBeTruthy();
        expect(oldCP instanceof custom_price_1.CustomPrice).toBeFalsy();
        expect(cpArr instanceof Array).toBeTruthy();
        expect(oldCP instanceof Array).toBeFalsy();
        const newOne = custom_price_1.CustomPrices.convertFromOldVersion(oldCP);
        expect(newOne[0].itemID).toBe(115524);
        expect(newOne[0].price).toBe(200000);
    });
});
//# sourceMappingURL=custom-price.spec.js.map