import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';

import { IUser, IAuction  } from '../../utils/interfaces';
import { user, itemClasses, lists, getPet, copperToArray } from '../../utils/globals';

declare var $WowheadPower;
declare var $wu;

@Component({
	selector: 'my-auctions',
	templateUrl: 'my.auctions.component.html',
	styleUrls: ['auctions.component.css']
})

export class MyAuctionsComponent {
	private searchQuery = '';
	private filterByCharacter = false;
	private onlyCraftables = false;
	private filter = { 'itemClass': '-1', 'itemSubClass': '-1' };
	private filterForm: FormGroup;
	private character: string;
	private activeAuctions = 0;
	private auctionsValue = 0;
	private apiToUse = user.apiToUse;

	// Objects and arrays
	private user: IUser;
	private itemClasses = {};
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};
	private selectedAuctions = [];
	private auctionDuration = {
		'VERY_LONG': '12h+',
		'LONG': '2-12h',
		'MEDIUM': '30min-2h',
		'SHORT': '<30min'
	};

	// Numbers
	private limit: number = 10;// per page
	private index: number = 0;
	private numberOfAuctions: number = 0;
	private numberOfUndercuttedAuctions: number = 0;
	private currentPage: number = 1;
	private numOfPages: number = this.numberOfAuctions / this.limit;

	private buyOutAsc: boolean = true;

	constructor() {
		this.character = user.character;
	}

	copperToArray(c): string {
		//Just return a string
		var result = [];
		c = Math.round(c);
		result[0] = c % 100;
		c = (c - result[0]) / 100;
		result[1] = c % 100; //Silver
		result[2] = ((c - result[1]) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); //Gold
		return result[2] + 'g ' + result[1] + 's ' + result[0] + 'c';
	}

	getAuctionOwner(itemID): string {
		return lists.auctions[itemID].owner;
	};

	getIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		if (auction.petSpeciesId !== undefined) {
			if (lists.pets[auction.petSpeciesId] === undefined) {
				getPet(auction.petSpeciesId);
			}
			icon = undefined;// TODO: this.petList[auction.petSpeciesId].icon;
		} else {
			icon = lists.items[auction.item].icon;
		}
		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}

	getAuctions (): any[] {
		this.auctionsValue = 0;
		this.numberOfUndercuttedAuctions = 0;
		if(lists.myAuctions !== undefined && lists.myAuctions.length > 0) {
			this.activeAuctions = lists.myAuctions.length;
			lists.myAuctions.forEach(
				a => {
					this.auctionsValue += a.buyout * a.quantity;
					if(this.getAuctionOwner(a.item) !== this.character){
						this.numberOfUndercuttedAuctions++;
					}
				});
		}
		return lists.myAuctions;
	}

	changePage(change: number): void {
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}
	sortAuctions(sortBy: string) {
		if (this.buyOutAsc) {
			this.buyOutAsc = false;
			lists.myAuctions.sort(
				function (a, b) {
					if(sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] < b[sortBy] / a['quantity'] ? 1 :-1;
					}else {
						return a[sortBy] < b[sortBy] ? 1 :-1;
					}
				}
			);
		} else {
			this.buyOutAsc = true;
			lists.myAuctions.sort(
				function (a, b) {
					if(sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] > b[sortBy] / a['quantity'] ? 1 : -1;
					} else {
						return a[sortBy] > b[sortBy] ? 1 : -1;
					}
				}
			);
		}
	}

	getNumOfPages() {
		let size = lists.myAuctions !== undefined ? lists.myAuctions.length : 0;
		this.numOfPages = size / this.limit;
		return Math.round(this.numOfPages);
	}
	getItemIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		if (auction.petSpeciesId !== undefined) {
			if (lists.pets[auction.petSpeciesId] === undefined) {
				this.getPet(auction.petSpeciesId);
			}
			icon = lists.pets[auction.petSpeciesId].icon;
		} else {
			icon = lists.items[auction.item].icon;
		}
		if (icon === undefined || icon === '') {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}

	getItemName(auction): string {
		let itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = this.getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
			return this.getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
		} else {
			if (lists.items[itemID] !== undefined) {
				if (lists.items[itemID]['name'] === 'Loading') {
					// TODO: this.getItem(itemID);
				}
				return lists.items[itemID]['name'];
			}
		}
		return 'no item data';
	}

	selectAuction(auctions): void {
		this.selectedAuctions = lists.auctions[auctions.item].auctions.sort(function(a,b){
			return a.buyout/a.quantity - b.buyout/b.quantity;
		});
	}

	getPet(speciesId) {
		/*if (lists.pets[speciesId] === undefined) {
			lists.pets[speciesId] = {
				"speciesId": speciesId,
				"petTypeId": 0,
				"creatureId": 54730,
				"name": "Loading",
				"icon": "spell_shadow_summonimp",
			};
			this.petObserver = this.itemService.getPet(speciesId).subscribe(
				r => {
					lists.pets[speciesId] = r;
				}
			);
		}
		return lists.pets[speciesId].name;*/
	}
}
