"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const auctions_component_1 = require("../components/auctions/auctions.component");
const test_module_1 = require("../modules/test.module");
const shared_service_1 = require("../services/shared.service");
const auction_item_1 = require("./auction/auction-item");
const filtering_1 = require("./filtering");
const item_1 = require("./item/item");
describe('Filters', () => {
    let component;
    let fixture;
    beforeEach(testing_1.async(() => {
        testing_1.TestBed.configureTestingModule({
            imports: [test_module_1.TestModule]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = testing_1.TestBed.createComponent(auctions_component_1.AuctionsComponent);
        component = fixture.componentInstance;
        shared_service_1.SharedService.user.apiToUse = 'tsm';
        fixture.detectChanges();
    });
    describe('should be able to check if demand query is matching', () => {
        it('When an auction item is below set value, false shall be returned', () => {
            const ai = new auction_item_1.AuctionItem();
            ai.regionSaleRate = 0.08;
            ai.itemID = 25;
            shared_service_1.SharedService.auctionItemsMap[ai.itemID] = ai;
            component.form.controls['saleRate'].setValue(9);
            expect(filtering_1.Filters.isSaleRateMatch(ai.itemID, component.form)).toBeFalsy();
        });
        it('When an auction item is equal set value, true shall be returned', () => {
            const ai = new auction_item_1.AuctionItem();
            ai.regionSaleRate = 0.09;
            ai.itemID = 25;
            shared_service_1.SharedService.auctionItemsMap[ai.itemID] = ai;
            component.form.controls['saleRate'].setValue(9);
            expect(filtering_1.Filters.isSaleRateMatch(ai.itemID, component.form)).toBeTruthy();
        });
        it('When an auction item is above set value, true shall be returned', () => {
            const ai = new auction_item_1.AuctionItem();
            ai.regionSaleRate = 0.10;
            ai.itemID = 25;
            shared_service_1.SharedService.auctionItemsMap[ai.itemID] = ai;
            component.form.controls['saleRate'].setValue(9);
            expect(filtering_1.Filters.isSaleRateMatch(ai.itemID, component.form)).toBeTruthy();
        });
    });
    describe('should be able to check if item class query is working', () => {
        it('Should accept all item classes with a -1 or null value', () => {
            const ai = new auction_item_1.AuctionItem();
            shared_service_1.SharedService.items[25] = new item_1.Item();
            shared_service_1.SharedService.items[25].itemClass = '1';
            ai.itemID = 25;
            shared_service_1.SharedService.auctionItemsMap[ai.itemID] = ai;
            component.form.controls['itemClass'].setValue(null);
            expect(filtering_1.Filters.isItemClassMatch(ai.itemID, component.form)).toBeTruthy();
            component.form.controls['itemClass'].setValue(-1);
            expect(filtering_1.Filters.isItemClassMatch(ai.itemID, component.form)).toBeTruthy();
        });
        it('Should be able true if the itemClass is a match', () => {
            const ai = new auction_item_1.AuctionItem();
            shared_service_1.SharedService.items[25] = new item_1.Item();
            shared_service_1.SharedService.items[25].itemClass = '0';
            ai.itemID = 25;
            shared_service_1.SharedService.auctionItemsMap[ai.itemID] = ai;
            console.log(shared_service_1.SharedService.items);
            component.form.controls['itemClass'].setValue('1');
            expect(shared_service_1.SharedService.items[25].itemClass).toEqual('0');
            expect(component.form.value['itemClass']).toEqual('1');
            expect(filtering_1.Filters.isItemClassMatch(ai.itemID, component.form)).toBeTruthy();
        });
    });
});
//# sourceMappingURL=filtering.spec.js.map