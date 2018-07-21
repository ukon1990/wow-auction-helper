"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sorter_1 = require("./sorter");
const shared_service_1 = require("../services/shared.service");
const auction_item_1 = require("./auction/auction-item");
let sorter, arr = [];
beforeEach(() => {
    sorter = new sorter_1.Sorter();
    arr = [
        { id: 1, name: 'Arch' },
        { id: 2, name: 'Aisha' },
        { id: 3, name: 'Yoghurt' },
        { id: 4, name: 'Banana' },
        { id: 5, name: 'Jonas' },
        { id: 6, name: 'Mint' }
    ];
});
describe('sort', () => {
    it('should sort strings ascending', () => {
        sorter.addKey('name');
        sorter.addKey('name');
        sorter.sort(arr);
        expect(arr).toEqual([
            { id: 2, name: 'Aisha' },
            { id: 1, name: 'Arch' },
            { id: 4, name: 'Banana' },
            { id: 5, name: 'Jonas' },
            { id: 6, name: 'Mint' },
            { id: 3, name: 'Yoghurt' }
        ]);
    });
    it('should sort strings descending', () => {
        sorter.addKey('name');
        sorter.sort(arr);
        expect(arr).toEqual([
            { id: 3, name: 'Yoghurt' },
            { id: 6, name: 'Mint' },
            { id: 5, name: 'Jonas' },
            { id: 4, name: 'Banana' },
            { id: 1, name: 'Arch' },
            { id: 2, name: 'Aisha' }
        ]);
    });
    it('should sort numbers ascending', () => {
        sorter.addKey('id');
        sorter.addKey('id');
        sorter.sort(arr);
        expect(arr).toEqual([
            { id: 1, name: 'Arch' },
            { id: 2, name: 'Aisha' },
            { id: 3, name: 'Yoghurt' },
            { id: 4, name: 'Banana' },
            { id: 5, name: 'Jonas' },
            { id: 6, name: 'Mint' }
        ]);
    });
    it('should sort numbers descending', () => {
        sorter.addKey('id');
        sorter.sort(arr);
        expect(arr).toEqual([
            { id: 6, name: 'Mint' },
            { id: 5, name: 'Jonas' },
            { id: 4, name: 'Banana' },
            { id: 3, name: 'Yoghurt' },
            { id: 2, name: 'Aisha' },
            { id: 1, name: 'Arch' }
        ]);
    });
    it('getItemToSort returns the desired value if the key was found on the item', () => {
        shared_service_1.SharedService.auctionItemsMap[1] = new auction_item_1.AuctionItem();
        shared_service_1.SharedService.auctionItemsMap[1].id = 1;
        shared_service_1.SharedService.auctionItemsMap[1].buyout = 10;
        sorter.addKey('buyout');
        expect(sorter.getItemToSort(sorter.getKey('buyout'), { item: 1 })).toBe(10);
    });
    it('getItemToSort tries to get auction item if the item did not contain the key', () => {
        shared_service_1.SharedService.auctionItemsMap[1] = new auction_item_1.AuctionItem();
        shared_service_1.SharedService.auctionItemsMap[1].id = 1;
        shared_service_1.SharedService.auctionItemsMap[1].buyout = 10;
        sorter.addKey('buyout');
        expect(sorter.getItemToSort(sorter.getKey('buyout'), { item: 1 })).toBe(10);
    });
});
//# sourceMappingURL=sorter.spec.js.map