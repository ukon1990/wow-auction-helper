import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuctionService } from '../../services/auctions';
import { ItemService } from '../../services/item';

import { user, itemClasses, lists, copperToArray, getPet } from '../../utils/globals';
import { IUser, IAuction } from '../../utils/interfaces';

declare var $WowheadPower;
declare var $wu;

@Component({
	selector: 'auctions',
	templateUrl: 'auctions.component.html',
	styleUrls: ['auctions.component.css'],
	providers: [AuctionService, ItemService]
})

export class AuctionComponent {
	// Strings
	private title = 'Auctions';
	private searchQuery = '';
	private filterByCharacter = false;
	private onlyCraftables = false;
	private filter = { 'itemClass': '-1', 'itemSubClass': '-1' };
	private filterForm: FormGroup;

	// Objects and arrays
	private user: IUser;
	private itemClasses = {};

	private auctionDuration = {
		'VERY_LONG': '12h+',
		'LONG': '2-12h',
		'MEDIUM': '30min-2h',
		'SHORT': '<30min'
	};

	private filteredAuctions = [];
	private wowUList = [];

	// Numbers
	private limit: number = 10;// per page
	private index: number = 0;
	private numberOfAuctions: number = 0;
	private currentPage: number = 1;
	private numOfPages: number = this.numberOfAuctions / this.limit;

	private buyOutAsc: boolean = true;

	constructor(
		private auctionService: AuctionService,
		private itemService: ItemService,
		private formBuilder: FormBuilder) {
		this.user = user;
		this.filteredAuctions = lists.auctions;
		this.itemClasses = itemClasses;
		this.filterForm = formBuilder.group({
			'searchQuery': '',
			'filterByCharacter': this.filterByCharacter,
			'onlyCraftables': this.onlyCraftables,
			'itemClass': this.filter.itemClass,
			'itemSubClass': this.filter.itemSubClass
		});
	}

	ngOnInit(): void {
		if (lists.auctions !== undefined && lists.auctions.length > 0) {
			this.filterAuctions();
		}
	}

	getIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		if (auction.petSpeciesId !== undefined && lists.pets !== undefined) {
			if (lists.pets[auction.petSpeciesId] === undefined) {
				getPet(auction.petSpeciesId);
			}
			icon = lists.pets[auction.petSpeciesId].icon;
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

	changePage(change: number): void {
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}

	getDescription(itemID: string): string {
		let item = lists.items[itemID];
		if (item['description'] !== undefined && item['description'].length > 0) {
			return item['description'];
		} else if (item['itemSpells'] !== undefined) {
			let itemSpells = item['itemSpells'];
			if (itemSpells.length > 0) {
				return itemSpells[0]['spell']['description'];
			}
		}
	}

	clearFilters(): void {
		this.filterForm.value['searchQuery'] = '';
		this.filterForm.value['filterByCharacter'] = false;
		this.filterForm.value['itemClass'] = '-1';
		this.filterForm.value['itemSubClass'] = '-1';

	}

	filterAuctions(): void {
		// From form
		this.searchQuery = this.filterForm.value['searchQuery'];
		this.filterByCharacter = this.filterForm.value['filterByCharacter'];
		this.onlyCraftables = this.filterForm.value['onlyCraftables'];
		this.filter = {
			'itemClass': this.filterForm.value['itemClass'],
			'itemSubClass': this.filterForm.value['itemSubClass']
		};

		this.numberOfAuctions = 0;
		this.currentPage = 1;
		this.filteredAuctions = [];

		// If the list filter is set to battlepet, we  need to open all the "Pet cages"
		let scanList = this.filter.itemClass === '1' ? lists.auctions[82800].auctions : lists.auctions;
		for (let id in scanList) {
			if (scanList.hasOwnProperty(id)) {
				let match = true;
				// Matching against item type
				if (this.isTypeMatch(lists.items[this.filter.itemClass === '1' ? 82800 : id]) && match) {
					match = true;
				} else {
					match = false;
				}

				if (this.filterByCharacter || this.searchQuery.length > 0 || this.onlyCraftables) {
					// Matching against item name
					if (this.searchQuery.length !== 0 && match) {
						// TODO: Used to use getItemName()
						if (scanList[id].name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1) {
							match = true;
						} else {
							match = false;
						}
					}

					// Matching against auction owner
					if (this.filterByCharacter && match) {
						try {
							match = scanList[id].owner.toString().toLowerCase() === user.character.toLowerCase();
						} catch (err) { match = false; }
					}
					// Item source
					if (this.onlyCraftables && match) {
						match = lists.items[id]['itemSource'] !== undefined &&
							lists.items[id]['itemSource']['sourceType'] === 'CREATED_BY_SPELL';
					}
				}
				if (match) {
					this.numberOfAuctions++;
					this.filteredAuctions.push(scanList[id]);
				}
			}
		}
		this.numOfPages = Math.round(this.numberOfAuctions / this.limit);
	}

	isTypeMatch(item): boolean {
		let match = false;
		if (this.filter.itemClass == '-1' || item.itemClass == itemClasses.classes[this.filter.itemClass].class) {
			// TODO: handle undefined subClass
			if (this.filter.itemSubClass == '-1' ||
				item.itemSubClass == itemClasses
					.classes[this.filter.itemClass]
					.subclasses[this.filter.itemSubClass].subclass) {
				match = true;
			} else {
				match = false;
			}
		}
		return match;
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

	sortAuctions(sortBy: string) {
		if (this.buyOutAsc) {
			this.buyOutAsc = false;
			this.filteredAuctions.sort(
				function (a, b) {
					if (sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] < b[sortBy] / a['quantity'] ? 1 : -1;
					} else {
						return a[sortBy] < b[sortBy] ? 1 : -1;
					}
				}
			);
		} else {
			this.buyOutAsc = true;
			this.filteredAuctions.sort(
				function (a, b) {
					if (sortBy === 'buyout' || sortBy === 'bid') {
						return a[sortBy] / a['quantity'] > b[sortBy] / a['quantity'] ? 1 : -1;
					} else {
						return a[sortBy] > b[sortBy] ? 1 : -1;
					}
				}
			);
		}
	}

	saveSettings(): void {
		localStorage.setItem('region', user.region);
		localStorage.setItem('realm', user.realm);
		localStorage.setItem('charater', user.character);
	}
}
