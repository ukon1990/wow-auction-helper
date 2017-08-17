import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material';
import { IUser } from '../../../utils/interfaces';
import { lists } from '../../../utils/globals';

@Component({
	selector: 'app-craft-table',
	templateUrl: 'craft.table.component.html',
	styleUrls: ['../../auctions/auctions.component.css', '../crafting.component.css']
})

export class CraftTableComponent {
	@Input() crafts: any;
	@Input() user: IUser;
	@Input() atAH: Function;
	@Input() getIcon: Function;
	@Input() getName: Function;
	@Input() getProfitPercent: Function;
	@Input() getMinPrice: Function;
	@Input() getAuctionItem: Function;
	@Input() getApiItem: Function;
	@Input() sortList: Function;
	@Input() pageEvent: PageEvent;
	@Input() percentOf: Function;
	@Input() openMenu: Function;
	@Input() sortProfitBy: string;
	@Output() addToCart = new EventEmitter();
	@Output() removeFromCart = new EventEmitter();
	constructor() {}

	isAtAH(itemID: string): boolean {
		return lists.auctions[itemID] !== undefined ? true : false;
	}
}
