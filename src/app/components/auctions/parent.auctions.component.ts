// Imports
import { FormBuilder, FormGroup } from '@angular/forms';
import { IUser, IAuction } from '../../utils/interfaces';
import { user, itemClasses, lists, getPet, copperToArray, copperToString } from '../../utils/globals';

declare var $WowheadPower;
declare var $wu;

export abstract class ParentAuctionComponent {
	filterForm: FormGroup;
	searchQuery = '';
	numberOfAuctions: number = 0;
	currentPage: number = 1;
	user: IUser;
	limit: number = 8;// per page
	index: number = 0;
	numOfPages: number = this.numberOfAuctions / this.limit;
	currentAuctionPage: number = 1;
	numOfAuctionPages: number = this.numberOfAuctions / this.limit;
	apiToUse = user.apiToUse;

	// Imported functions to be used in the templates
	copperToArray = copperToArray;
	copperToString = copperToString;

	character: string;
	selectedAuctions = [];
	auctionDuration = {
		'VERY_LONG': '12h+',
		'LONG': '2-12h',
		'MEDIUM': '30min-2h',
		'SHORT': '<30min'
	};

	// Objects and arrays
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};


	constructor() {
		this.user = user;
		this.character = user.character;
	}

	getIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon, itemID = auction.item !== undefined ? auction.item : auction.itemID;
		try {
			if (auction.petSpeciesId !== undefined && lists.pets !== undefined) {
				if (lists.pets[auction.petSpeciesId] === undefined) {
					getPet(auction.petSpeciesId);
				}
				icon = lists.pets[auction.petSpeciesId].icon;
			} else if(lists.items[itemID] !== undefined) {
				icon = lists.items[itemID].icon;
			}
		} catch(err) {console.log(err,auction, itemID);}

		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}

	getItem(itemID: string) {
		return lists.items[itemID] || {'name': itemID};
	}

	getItemName(auction): string {
		let itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
			return getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
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
		if(lists.auctions[auctions.item] !== undefined) {
			this.selectedAuctions = lists.auctions[auctions.item].auctions.sort(function(a,b){
				return a.buyout/a.quantity - b.buyout/b.quantity;
			});
		this.numOfAuctionPages = Math.round(lists.auctions[auctions.item].auctions.length / this.limit);

		} else if(auctions.petAuctions !== undefined) {
			this.selectedAuctions = auctions.petAuctions.sort(function(a,b){
				return a.buyout/a.quantity - b.buyout/b.quantity;
			});

		this.numOfAuctionPages = Math.round(auctions.petAuctions.length / this.limit);
		} else {
			this.selectedAuctions = auctions.auctions.sort(function(a,b){
				return a.buyout/a.quantity - b.buyout/b.quantity;
			});
		this.numOfAuctionPages = Math.round(auctions.auctions.length / this.limit);
		}
	}

	getNumOfPages() {
		let size = lists.myAuctions !== undefined ? lists.myAuctions.length : 0;
		this.numOfPages = size / this.limit;
		return Math.round(this.numOfPages);
	}

	changePage(change: number): void {
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}

	changeAuctionPage(change: number): void {
		if (change > 0 && this.currentAuctionPage <= this.numOfAuctionPages) {
			this.currentAuctionPage++;
		} else if (change < 0 && this.currentAuctionPage > 1) {
			this.currentAuctionPage--;
		}
	}

	abstract sortList(sortBy: string);
}
