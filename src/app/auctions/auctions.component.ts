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
    private observer = {};
    private observertwo = {};
    private auctions = [];
    private autionList = [];
    private shit = {};

    private limit: number = 100;
    private index: number = 0;
    private numberOfAuctions: number = 0;

    constructor(
        private auctionService: AuctionService,
        private itemService: ItemService
    ){}

    ngOnInit(): void {
        this.observer = this.auctionService.getAuctions()
            .subscribe(
                r => {
                    this.auctions = this.buildAuctionArray(r.auctions)
                }
            );
    }

    buildAuctionArray(arr){
        let list = [];
        let i = 0;
        for(let o of arr){
            list[o.auc] = o;
        }
        return list;
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
        this.observertwo = this.itemService.getItem(id)
            .subscribe(
                r => this.shit = r
            );
    }

}
