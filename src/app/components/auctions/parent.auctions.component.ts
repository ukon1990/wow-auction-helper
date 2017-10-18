// Imports
import { FormBuilder, FormGroup } from '@angular/forms';
import { IUser, IAuction } from '../../utils/interfaces';
import { PageEvent } from '@angular/material';
import { user, lists, getIcon } from '../../utils/globals';
import { itemClasses } from '../../utils/objects';
import { Item } from '../../utils/item';
import { Sorter } from '../../utils/sorter';

declare var $WowheadPower;
declare var $wu;
declare const ga: Function;

export abstract class ParentAuctionComponent {
	filterForm: FormGroup;
	searchQuery = '';
	numberOfAuctions = 0;
	currentPage = 1;
	user: IUser;
	limit = 8; // per page
	index = 0;
	numOfPages: number = this.numberOfAuctions / this.limit;
	currentAuctionPage = 1;
	numOfAuctionPages: number = this.numberOfAuctions / this.limit;
	apiToUse = user.apiToUse;
	sorter: Sorter;

	// Imported functions to be used in the templates
	getIcon = Item.getIcon;

	character: string;
	selectedAuctions = [];
	auctionDuration = {
		'VERY_LONG': '12h+',
		'LONG': '2-12h',
		'MEDIUM': '30min-2h',
		'SHORT': '<30min'
	};

	// For md-pagignator
	page = {
		pageSize: 8,
		pageSizeOptions: [4, 8, 12, 16, 20, 24]
	};
	pageEvent: PageEvent = { pageIndex: 0, pageSize: this.page.pageSize, length: 1 };
	pageEventSecondary: PageEvent = { pageIndex: 0, pageSize: this.page.pageSize, length: 1 };

	// Objects and arrays
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};


	constructor() {
		this.user = user;
		this.character = user.character;
		this.sorter = new Sorter();
	}


	/**
	 * Fetches a item from the memory
	 * @param  {string} itemID An items ID
	 * @return {Item}        The desired object
	 */
	getItem(itemID: string) {
		return lists.items[itemID] || {'name': itemID};
	}

	/**
	 * Used to get the items name. This will retrieve the pet's name if it's a pet auction.
	 * @param  {Auction} auction The given auction
	 * @return {string}         Item name, or pet name + pet level
	 */
	getItemName(auction): string {
		const itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = lists.pets[auction.petSpeciesId].name + ' @' + auction.petLevel;
			return auction['name'];
		} else {
			if (lists.items[itemID] !== undefined) {
				if (lists.items[itemID]['name'] === 'Loading') {
					// TODO: this.getItem(itemID);
				}
				return lists.items[itemID]['name'];
			}
		}
		ga('send', {
			hitType: 'event',
			eventCategory: 'Auctions',
			eventAction: 'item not found',
			eventLabel: `Item with ID=${auction.item} not found`
		});
		return 'no item data for ' + auction.item;
	}

	/**
	 * Selects a spesific items auctions
	 * @param {[type]} auctions an auction item
	 */
	selectAuction(auctions): void {
		if (auctions.petAuctions !== undefined) {
			this.selectedAuctions = auctions.petAuctions.sort(function(a, b) {
				return a.buyout / a.quantity - b.buyout / b.quantity;
			});

			this.numOfAuctionPages = Math.ceil(auctions.petAuctions.length / this.limit);
		} else if (lists.auctions[auctions.item] !== undefined) {
			this.selectedAuctions = lists.auctions[auctions.item].auctions.sort(function(a, b) {
				return a.buyout / a.quantity - b.buyout / b.quantity;
			});
		this.numOfAuctionPages = Math.ceil(lists.auctions[auctions.item].auctions.length / this.limit);

		} else {
			this.selectedAuctions = auctions.auctions.sort(function(a, b) {
				return a.buyout  / a.quantity - b.buyout / b.quantity;
			});
			this.numOfAuctionPages = Math.ceil(auctions.auctions.length / this.limit);
		}

		this.pageEventSecondary.pageIndex = 0;

		ga('send', {
			hitType: 'event',
			eventCategory: 'Auctions',
			eventAction: 'Selected auction',
			eventLabel: `Selected auction is ${lists.items[auctions.item].name}`
		});
	}

	/**
	 * Retrieves the total number of pages rounded up
	 * @return {number}
	 */
	getNumOfPages(): number {
		this.numOfPages = (lists.myAuctions !== undefined ? lists.myAuctions.length : 0) / this.limit;
		return Math.ceil(this.numOfPages);
	}

	/**
	 * Used for changing the page
	 * @param {PageEvent} event
	 */
	changePage(event: PageEvent, secondary?: boolean) {
		if (secondary) {
			this.pageEventSecondary = event;
		} else {
			this.pageEvent = event;
		}
	}

	/**
	 * Is used to change between the pages of a selected item
	 * @param {number} change The value change. Either 1 or -1
	 */
	changeAuctionPage(change: number): void {
		if (change > 0 && this.currentAuctionPage < this.numOfAuctionPages) {
			this.currentAuctionPage++;
		} else if (change < 0 && this.currentAuctionPage > 1) {
			this.currentAuctionPage--;
		}
	}
}
