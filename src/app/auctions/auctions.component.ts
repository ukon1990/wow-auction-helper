import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { AuctionService } from '../services/auctions';
import { ItemService } from '../services/item';

import { Auction } from '../types/auction';

@Component({
    selector: 'auctions',
    templateUrl: 'auctions.component.html',
    styleUrls: ['auctions.component.css'],
    providers: [AuctionService, ItemService]
})

export class AuctionComponent{
    private title = 'Auctions';
    private auctionObserver = {};
    private itemObserver = {};
    private auctions = [];
    private autionList = [];
    private itemList = {};

    private limit: number = 100;
    private index: number = 0;
    private numberOfAuctions: number = 0;
    private buyOutAsc: boolean = true;

    constructor(
        private auctionService: AuctionService,
        private itemService: ItemService
    ){}

    ngOnInit(): void {
        this.itemObserver = this.itemService.getItems()
            .subscribe(
                i => {
                    this.itemList = this.buildItemArray(i)
                }
            );
    }

    buildItemArray(arr){
        let items = [];
        for(let i of arr){
            items[i['id']] = i;
        }
        this.auctionObserver = this.auctionService.getAuctions()
            .subscribe(
                r => {
                    this.auctions = this.buildAuctionArray(r.auctions)
                }
            );
        return items;
    }

    getItemName(itemID): string{
        if(this.itemList[itemID] !== undefined){
            if(this.itemList[itemID] === 'Loading'){
                this.getItem(itemID);
            }
            return this.itemList[itemID]['name'];
        }
        return 'no item data';
    }

    buildAuctionArray(arr){
        for(let o of arr){
            if(this.itemList[o.item] === undefined){
                this.itemList[o.item] = {"id": o.item, "name": "Loading"}
            }
        }
        return arr;
    }

    getSize(list): number{
        let count = 0;
        for(let c of list){
            count++;
        }
        return count;
    }

    getType(anything): string{
        return typeof anything;
    }

    getItem(id){
        this.itemObserver = this.itemService.getItem(id)
            .subscribe(
                r => this.itemList[r['id']] = r
            );
    }

    copperToArray(c) : string{
        //Just return a string
        var result = [];
        result[0] = c % 100;
        c = (c - result[0]) / 100;
        result[1] = c % 100; //Silver
        result[2] = ( (c - result[1])/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //Gold
        return result[2] + "g " + result[1] + "s " + result[0] + "c";
    }

    sortAuctions(sortBy: string){
        if(this.buyOutAsc){
            this.buyOutAsc = false;
            this.auctions.sort(
                function(a, b){
                    if(a[sortBy] < b[sortBy]){
                        return 1;
                    }
                    return -1;
                }
            );
        }else{
            this.buyOutAsc = true;
            this.auctions.sort(
                function(a, b){
                    if(a[sortBy] > b[sortBy]){
                        return 1;
                    }
                    return -1;
                }
            );
        }
    }
}