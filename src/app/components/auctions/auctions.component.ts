import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentAuctionComponent } from './parent.auctions.component';
import { AuctionService } from '../../services/auctions';
import { ItemService } from '../../services/item';
import { Title } from '@angular/platform-browser';

import { user, itemClasses, lists, getPet } from '../../utils/globals';
import { IUser, IAuction } from '../../utils/interfaces';

@Component({
	selector: 'auctions',
	templateUrl: 'auctions.component.html',
	styleUrls: ['auctions.component.css'],
	providers: [AuctionService, ItemService]
})

export class AuctionComponent extends ParentAuctionComponent {

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
		private formBuilder: FormBuilder) {
		super();
		this.filteredAuctions = lists.auctions;
		this.itemClasses = itemClasses;
		let filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;

		if(filter !== undefined) {
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
			let refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0) {
						this.filterAuctions();
						clearInterval(refreshId);
					}
				} catch(e) {console.log(e);}
			}, 100);
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
		let demand = this.filterForm.value['demand'],
			mktPrice = this.filterForm.value['mktPrice'] || 0,
			onlyVendorSellable = this.filterForm.value['onlyVendorSellable'],
			searchQuery = this.filterForm.value['searchQuery'],
			scanList,
			petsAdded = {};
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
		if(this.filter.itemClass === '0') {
			if(lists.auctions[82800] !== undefined) {
				lists.auctions[82800].auctions.forEach(r => {
					if(r.petSpeciesId !== undefined && (petsAdded[r.petSpeciesId] === undefined || petsAdded[r.petSpeciesId].buyout > r.buyout)) {
						petsAdded[r.petSpeciesId] = r;
					}
				});
				scanList = petsAdded;
			}
		} else {
			scanList = lists.auctions;
		}

		for (let id in scanList) {
			if (scanList.hasOwnProperty(id)) {
				let  match = true;
				// Assigning auc ID to pets
				if(scanList[id].item === 82800) {
					try {
						let auctionsForPet = [];
						lists.auctions[82800].auctions.forEach(r => {
							if(r.petSpeciesId !== undefined && r.petSpeciesId === scanList[id].petSpeciesId) {
								auctionsForPet.push(r);;
							}
						});
						scanList[id].petAuctions = auctionsForPet;
					} catch(err) {
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
					if(match && (demand === 0 || demand <= scanList[id].estDemand) ) {
						match = true;
					} else {
						match = false;
					}

					let valueOfMkt = this.buyoutVersusMarketValue(scanList[id]);
					if(match &&
						(mktPrice === 0 || (valueOfMkt > 0 && mktPrice > valueOfMkt) ) ) {
						match = true;
					} else {
						match = false;
					}

					if(match && onlyVendorSellable) {
						if(scanList[id].buyout < lists.items[id].sellPrice) {
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

	sortList(sortBy: string) {
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

	buyoutVersusMarketValue(auction) {
		if(auction.mktPrice === 0) {
			return 0;
		}
		return Math.round((auction.buyout / auction.mktPrice) * 100);
	}

	bidVersusMarketValue(auction) {
		if(auction.mktPrice === 0) {
			return 0;
		}
		return Math.round(
			(auction.bid / auction.mktPrice) * 100);
	}
}
