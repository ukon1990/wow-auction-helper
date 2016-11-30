import { Component } from '@angular/core';
import { NgClass } from '@angular/common'
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

    constructor(
        private auctionService: AuctionService,
        private itemService: ItemService
    ){}

    ngOnInit(): void {
        this.itemObserver = this.itemService.getItems()
            .subscribe(
                i => {
                    this.itemList = i
                }
            );
        this.auctionObserver = this.auctionService.getAuctions()
            .subscribe(
                r => {
                    this.auctions = this.buildAuctionArray(r.auctions)
                }
            );
    }

    buildItemArray(arr){
        let items = [];
        for(let i of arr){
            items[i['id']] = i.data;
        }
        return items;
    }

    getItemName(itemID): string{
        if(this.itemList[itemID] !== undefined){
            return this.itemList[itemID]['name'];
        }
        return 'no item data';
    }

    buildAuctionArray(arr){
        for(let o of arr){
            if(this.itemList[o.item] === undefined){
                this.itemList[o.item] = {"id": o.item, "name": "Loading"}
                this.getItem(o.item);
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
}