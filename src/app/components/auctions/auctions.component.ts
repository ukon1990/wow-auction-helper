import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { ParentAuctionComponent } from './parent.auctions.component';
import { AuctionService } from '../../services/auctions.service';
import { ItemService } from '../../services/item.service';
import { Title } from '@angular/platform-browser';

import { lists } from '../../utils/globals';
import Pets from '../../utils/pets';
import { IUser, IAuction } from '../../utils/interfaces';
import { itemClasses } from '../../utils/objects';
import { FileService } from '../../services/file.service';

declare const ga: Function;
@Component({
	selector: 'app-auctions',
	templateUrl: 'auctions.component.html',
	styleUrls: ['auctions.component.css'],
	providers: [AuctionService, ItemService]
})

export class AuctionComponent extends ParentAuctionComponent implements OnInit{

	// Objects and arrays
	itemClasses = {'classes': []};
	selectedItem = {'name': 'No item selected', 'auctions': []};
	filteredAuctions = [];

	private filter = { 'itemClass': '-1', 'itemSubClass': '-1' };
	private hasLoaded = false;
	private buyOutAsc = true;

	constructor(
		private router: Router, private titleService: Title,
		private auctionService: AuctionService, private itemService: ItemService,
		private formBuilder: FormBuilder, public exportFile: FileService) {
		super();
		this.filteredAuctions = lists.auctions;
		this.itemClasses = itemClasses;
		const filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;

		if (filter !== undefined) {
			this.filter = filter.filter;
		}

		this.filterForm = formBuilder.group({
			'searchQuery': filter !== undefined ? filter.searchQuery : '',
			'itemClass': this.filter.itemClass,
			'itemSubClass': this.filter.itemSubClass,
			'mktPrice': filter !== undefined && filter.mktPrice !== null ? parseFloat(filter.mktPrice) : 0,
			'demand': filter !== undefined && filter.demand !== null ? parseFloat(filter.demand) : 0,
			'onlyVendorSellable': filter !== undefined && filter.onlyVendorSellable !== null ? filter.onlyVendorSellable : false
		});
		this.titleService.setTitle('Wah - Auctions');
	}

	ngOnInit(): void {
		if (lists.auctions !== undefined && lists.auctions.length > 0) {
			this.filterAuctions();
		} else {
			const refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0) {
						this.filterAuctions();
						clearInterval(refreshId);
					}
				} catch (e) {
					console.log(e);
				}
			}, 100);
		}
	}

	/**
	 * Used to get a given pet for an auction
	 * @param  {string} speciesId Retrieves a pet
	 * @return {Pet}              Returns a pet object
	 */
	getPet(speciesId: number) {
		return Pets.getPet(speciesId);
	};

	/**
	 * Retrieves the description of a item
	 * @param  {string} itemID An items ID
	 * @return {string}        Item description
	 */
	getDescription(itemID: string): string {
		const item = lists.items[itemID];
		if (item['description'] !== undefined && item['description'].length > 0) {
			return item['description'];
		} else if (item['itemSpells'] !== undefined) {
			const itemSpells = item['itemSpells'];
			if (itemSpells.length > 0) {
				return itemSpells[0]['spell']['description'];
			}
		}
	}

	/**
	 * Used to clear the search filters
	 */
	resetFilters(): void {
		this.pageEvent.pageIndex = 0;
		this.filterForm.reset();
		this.filterForm.value['searchQuery'] = '';
		this.filterForm.value['filterByCharacter'] = false;
		this.filterForm.value['itemClass'] = '-1';
		this.filterForm.value['itemSubClass'] = '-1';

		this.filterAuctions();
		ga('send', {
			hitType: 'event',
			eventCategory: 'Auctions',
			eventAction: 'Filtering',
			eventLabel: 'Cleared filter'
		});
	}

	/**
	 * Used to filter the auctions by the users parameters
	 */
	filterAuctions(): void {
		// From form
		const demand = this.filterForm.value['demand'],
			mktPrice = this.filterForm.value['mktPrice'] || 0,
			onlyVendorSellable = this.filterForm.value['onlyVendorSellable'],
			searchQuery = this.filterForm.value['searchQuery'];

		let scanList;
		const petsAdded = {};

		this.filter = {
			'itemClass': this.filterForm.value['itemClass'],
			'itemSubClass': this.filterForm.value['itemSubClass']
		};

		localStorage.setItem(
			'query_auctions',
			JSON.stringify(
				{'searchQuery': searchQuery, 'demand': demand,
					'mktPrice': mktPrice, 'filter': this.filter, 'onlyVendorSellable': onlyVendorSellable}));
		this.numberOfAuctions = 0;
		this.currentPage = 1;
		this.filteredAuctions = [];


		// If the list filter is set to battlepet, we  need to open all the "Pet cages"
		if (this.filter.itemClass === '0') {
			if (lists.auctions[82800] !== undefined) {
				lists.auctions[82800].auctions.forEach(r => {
					if (r.petSpeciesId !== undefined &&
						(petsAdded[r.petSpeciesId] === undefined ||
							petsAdded[r.petSpeciesId].buyout > r.buyout)) {
						petsAdded[r.petSpeciesId] = r;
					}
				});
				scanList = petsAdded;
			}
		} else {
			scanList = lists.auctions;
		}

		for (const id in scanList) {
			if (scanList.hasOwnProperty(id)) {
				let  match = true;
				// Assigning auc ID to pets
				if (scanList[id].item === 82800) {
					try {
						const auctionsForPet = [];
						lists.auctions[82800].auctions.forEach(r => {
							if (r.petSpeciesId !== undefined && r.petSpeciesId === scanList[id].petSpeciesId) {
								auctionsForPet.push(r);
							}
						});
						scanList[id].petAuctions = auctionsForPet;
					} catch (err) {
						console.log(err);
					}
				}

				// Matching against item type
				if (this.isTypeMatch(lists.items[this.filter.itemClass === '0' ? 82800 : id]) && match) {
					match = true;
				} else {
					match = false;
				}

				if (match && searchQuery.length !== 0 && searchQuery.length > 0) {
					// Matching against item name
					if (scanList[id].name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
						match = true;
					} else {
						match = false;
					}
				}

				try {
					if (match && (demand === 0 || demand <= scanList[id].estDemand) ) {
						match = true;
					} else {
						match = false;
					}

					const valueOfMkt = this.buyoutVersusMarketValue(scanList[id]);
					if (match &&
						(mktPrice === 0 || (valueOfMkt > 0 && mktPrice > valueOfMkt) ) ) {
						match = true;
					} else {
						match = false;
					}

					if (match && onlyVendorSellable) {
						if (scanList[id].buyout < lists.items[id].sellPrice) {
							match = true;
						} else {
						match = false;
					}
					}
				} catch (err) {
					console.log(err);
				}

				if (match) {
					this.numberOfAuctions++;
					this.filteredAuctions.push(scanList[id]);
				}
			}
		}
		this.pageEvent.pageIndex = 0;

		ga('send', {
			hitType: 'event',
			eventCategory: 'Auctions',
			eventAction: 'Filtering',
			eventLabel: 'Applied filter'
		});
		this.sorter.sort(this.filteredAuctions);
	}

	/**
	 * Checks if an item is a mtach or not.
	 * @param  {object}  An item object
	 * @return {boolean}
	 */
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

	/**
	 * Used for sorting the list.
	 * @param  {string} sortBy A string for the field to sort by
	 */
	sortList(sortBy: string): void {
		if (this.buyOutAsc) {
			this.buyOutAsc = false;
			this.filteredAuctions.sort(
				function (a, b) {
					return a[sortBy] <= b[sortBy] ? 1 : -1;
				}
			);
		} else {
			this.buyOutAsc = true;
			this.filteredAuctions.sort(
				function (a, b) {
					return a[sortBy] >= b[sortBy] ? 1 : -1;
				}
			);
		}
	}

	/**
	 * Used to get the percent difference between buyout price and market value
	 * @param  {Auction} auction An item auction
	 * @return {number}         An integer with the result value
	 */
	buyoutVersusMarketValue(auction): number {
		if (auction.mktPrice === 0) {
			return 0;
		}
		return Math.round((auction.buyout / auction.mktPrice) * 100);
	}

	/**
	 * Returns the difference between the bid value and the market value in percent
	 * @param  {Auction} auction An item auction
	 * @return {number}         An integer with the result value
	 */
	bidVersusMarketValue(auction): number {
		if (auction.mktPrice === 0) {
			return 0;
		}
		return Math.round(
			(auction.bid / auction.mktPrice) * 100);
	}

	sort(key: string): void {
		this.sorter.addKey(key);
		this.sorter.sort(this.filteredAuctions);
	}
}
