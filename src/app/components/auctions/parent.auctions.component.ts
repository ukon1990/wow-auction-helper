// Imports
import { FormBuilder, FormGroup } from '@angular/forms';
import { IUser, IAuction } from '../../utils/interfaces';
import { user, itemClasses, lists, getPet, copperToArray, copperToString } from '../../utils/globals';

declare var $WowheadPower;
declare var $wu;

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

	/**
	 * Used to get the icon url for a given item or pet.
	 * @param  {Auction or Item} auction It takes a auction or Item object.
	 * @return {string}         [description]
	 */
	getIcon(auction): string {
		const itemID = auction.item !== undefined ? auction.item : auction.itemID;
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		try {
			if (auction.petSpeciesId !== undefined && lists.pets !== undefined) {
				if (lists.pets[auction.petSpeciesId] === undefined) {
					// getPet(auction.petSpeciesId);
				}
				icon = lists.pets[auction.petSpeciesId].icon;
			} else if (lists.items[itemID] !== undefined) {
				icon = lists.items[itemID].icon;
			}
		} catch (err) {console.log(err, auction, itemID); }

		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
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
	 * Is used to change between the pages
	 * @param {number} change The value change. Either 1 or -1
	 */
	changePage(change: number): void {
		if (change > 0 && this.currentPage < this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
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

	/**
	 * Used for sorting the list. This is implemented in the child class
	 * @param  {string} sortBy A string for the field to sort by
	 */
	abstract sortList(sortBy: string): void;
}
