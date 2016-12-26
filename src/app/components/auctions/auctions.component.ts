import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { AuctionService } from '../../services/auctions';
import { ItemService } from '../../services/item';

import { Auction } from '../../utils/types/auction';
import { user, itemClasses } from '../../utils/globals';

declare var $WowheadPower;

@Component({
    selector: 'auctions',
    templateUrl: 'auctions.component.html',
    styleUrls: ['auctions.component.css'],
    providers: [AuctionService, ItemService]
})

export class AuctionComponent {
    //Strings
    private title = 'Auctions';
    private searchQuery = '';
    private filterByCharacter = false;
    private filter = { 'itemClass': '0', 'itemSubClass': '0' };

    //Objects and arrays
    private user = {};
    private itemClasses = {};
    private auctionObserver = {};
    private itemObserver = {};
    private auctions = [];
    private autionList = [];
    private itemList = {};
    private auctionDuration = {
        'VERY_LONG': '12h+',
        'LONG': '2-12h',
        'MEDIUM': '30min-2h',
        'SHORT': '<30min'
    }

    //Numbers
    private limit: number = 10;//per page
    private index: number = 0;
    private numberOfAuctions: number = 0;
    private currentPage: number = 1;
    private numOfPages: number = this.numberOfAuctions / this.limit;

    private buyOutAsc: boolean = true;

    constructor(
        private auctionService: AuctionService,
        private itemService: ItemService) {
        this.user = user;
        this.itemClasses = itemClasses;
    }

    ngOnInit(): void {
        this.itemObserver = this.itemService.getItems()
            .subscribe(
            i => {
                this.buildItemArray(i)
            }
            );
    }

    changePage(change: number): void {
        if (change > 0 && this.currentPage <= this.numOfPages) {
            this.currentPage++;
        } else if (change < 0 && this.currentPage > 1) {
            this.currentPage--;
        }
        $WowheadPower.init();
    }

    getItemIcon(id: string): string {
        return 'http://media.blizzard.com/wow/icons/56/' +
            this.itemList[id].icon
            + '.jpg';
    }

    getToolTip(itemID: string) {
        if (this.itemList[itemID]['description'] === undefined) {
            this.getItem(itemID);
        }
    }

    getDescription(itemID: string): string {
        let item = this.itemList[itemID];
        if (item['description'] !== undefined && item['description'].length > 0) {
            return item['description'];
        } else if (item['itemSpells'] !== undefined) {
            let itemSpells = item['itemSpells'];
            if (itemSpells.length > 0) {
                return itemSpells[0]['spell']['description'];
            }
        }
    }

    getNumOfPages() {
        this.numOfPages = this.numberOfAuctions / this.limit;
        return Math.round(this.numOfPages);
    }

    filterAuctions(): Array<Object> {

        this.numberOfAuctions = 0;
        if (this.filterByCharacter || this.searchQuery.length > 0) {
            let list: Array<Object> = [];
            let match = true;
            for (let a of this.auctions) {
                if (this.filterByCharacter && a.owner === user.character
                    && this.isTypeMatch(this.itemList[a.item])
                    && this.getItemName(a.item).toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1
                    && this.isTypeMatch(this.itemList[a.item])) {
                    list.push(a);
                    this.numberOfAuctions++;
                } else if (!this.filterByCharacter
                    && this.isTypeMatch(this.itemList[a.item])
                    && this.getItemName(a.item).toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1) {
                    list.push(a);
                    this.numberOfAuctions++;
                } else if (this.isTypeMatch(this.itemList[a.item])
                    && this.getItemName(a.item).length === 0
                    && !this.filterByCharacter) {
                    list.push(a);

                    this.numberOfAuctions++;
                }
            }
            return list;
        }
        this.numberOfAuctions = this.auctions.length;
        return this.auctions;
    }

    isTypeMatch(item): boolean {
        let match: boolean = false;
        if (this.filter.itemClass === '0' || item.itemClass === itemClasses.classes[this.filter.itemClass].class) {
            match = true;
        }
        return match;
    }

    buildItemArray(arr) {
        let items = [];
        for (let i of arr) {
            items[i['id']] = i;
        }
        this.itemList = items;
        this.getAuctions();
    }

    getAuctions(): void {
        console.log('Loading auctions');
        this.auctionObserver = this.auctionService.getAuctions()
            .subscribe(
            r => {
                this.buildAuctionArray(r.auctions)
            }
            );
    }

    getItemName(itemID): string {
        if (this.itemList[itemID] !== undefined) {
            if (this.itemList[itemID]['name'] === 'Loading') {
                this.getItem(itemID);
            }
            return this.itemList[itemID]['name'];
        }
        return 'no item data';
    }

    buildAuctionArray(arr) {
        for (let o of arr) {
            this.numberOfAuctions++;
            if (this.itemList[o.item] === undefined) {
                this.itemList[o.item] = { 'id': o.item, 'name': 'Loading', 'icon': '' };
                //this.getItem(o.item);
            }
        }
        this.auctions = arr;
    }

    getSize(list): number {
        let count = 0;
        for (let c of list) {
            count++;
        }
        return count;
    }

    getItem(id) {
        this.itemObserver = this.itemService.getItem(id)
            .subscribe(
            r => this.itemList[r['id']] = r
            );
    }

    copperToArray(c): string {
        //Just return a string
        var result = [];
        result[0] = c % 100;
        c = (c - result[0]) / 100;
        result[1] = c % 100; //Silver
        result[2] = ((c - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); //Gold
        return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
    }

    sortAuctions(sortBy: string) {
        if (this.buyOutAsc) {
            this.buyOutAsc = false;
            this.auctions.sort(
                function (a, b) {
                    if (a[sortBy] < b[sortBy]) {
                        return 1;
                    }
                    return -1;
                }
            );
        } else {
            this.buyOutAsc = true;
            this.auctions.sort(
                function (a, b) {
                    if (a[sortBy] > b[sortBy]) {
                        return 1;
                    }
                    return -1;
                }
            );
        }
    }
}
