"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_service_1 = require("../../services/shared.service");
const auction_item_1 = require("../auction/auction-item");
const crafting_1 = require("./crafting");
const user_1 = require("../user/user");
const tsm_1 = require("../auction/tsm");
beforeEach(() => {
    user_1.User.restore();
    shared_service_1.SharedService.recipes.length = 0;
    shared_service_1.SharedService.auctionItemsMap[10] = new auction_item_1.AuctionItem();
    shared_service_1.SharedService.auctionItemsMap[10].buyout = 20;
    shared_service_1.SharedService.auctionItemsMap[11] = new auction_item_1.AuctionItem();
    shared_service_1.SharedService.auctionItemsMap[11].buyout = 10;
    shared_service_1.SharedService.auctionItemsMap[12] = new auction_item_1.AuctionItem();
    shared_service_1.SharedService.auctionItemsMap[12].buyout = 30;
    shared_service_1.SharedService.auctionItemsMap[20] = new auction_item_1.AuctionItem();
    shared_service_1.SharedService.auctionItemsMap[20].buyout = 10;
    shared_service_1.SharedService.tsm[20] = new tsm_1.TSM();
    shared_service_1.SharedService.tsm[20].MarketValue = 100;
    shared_service_1.SharedService.recipes.push({
        spellID: 1,
        itemID: 10,
        name: 'test recipe',
        profession: 'Software developer',
        minCount: 1,
        maxCount: 1,
        reagents: []
    });
});
describe('Crafting', () => {
    describe('Should be able to calculate cost', () => {
        it('for one reagent', () => {
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 11,
                name: '',
                count: 3,
                dropped: false
            });
            crafting_1.Crafting.calculateCost();
            expect(shared_service_1.SharedService.recipes[0].cost).toEqual(30);
            expect(shared_service_1.SharedService.recipes[0].roi).toEqual(-10);
        });
        it('for several reagents', () => {
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 11,
                name: '',
                count: 3,
                dropped: false
            });
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 12,
                name: '',
                count: 10,
                dropped: false
            });
            crafting_1.Crafting.calculateCost();
            expect(shared_service_1.SharedService.recipes[0].cost).toEqual(330);
            expect(shared_service_1.SharedService.recipes[0].roi).toEqual(-310);
        });
        it('if some items aren\'t at AH', () => {
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 1,
                name: '',
                count: 3,
                dropped: false
            });
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 12,
                name: '',
                count: 10,
                dropped: false
            });
            crafting_1.Crafting.calculateCost();
            expect(shared_service_1.SharedService.recipes[0].cost).toEqual(300);
            expect(shared_service_1.SharedService.recipes[0].roi).toEqual(-280);
        });
        it('if some items aren\'t at AH and use market value instead.', () => {
            // logic
            shared_service_1.SharedService.user.apiToUse = 'tsm';
        });
        it('The item is above set limit, so use market value instead.', () => {
            // Buyout is 200% of MV
            shared_service_1.SharedService.user.buyoutLimit = 200;
            shared_service_1.SharedService.user.apiToUse = 'tsm';
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 20,
                name: '',
                count: 3,
                dropped: false
            });
            shared_service_1.SharedService.recipes[0].reagents.push({
                itemID: 12,
                name: '',
                count: 10,
                dropped: false
            });
            // 100
            shared_service_1.SharedService.tsm[20].MarketValue = 15;
            crafting_1.Crafting.calculateCost();
            expect(shared_service_1.SharedService.recipes[0].cost).toEqual(180);
        });
        it('if some items aren\'t at AH and use avg sold for value instead.', () => {
            shared_service_1.SharedService.user.apiToUse = 'tsm';
        });
    });
    describe('Disenchant crafting', () => { });
});
//# sourceMappingURL=crafting.spec.js.map