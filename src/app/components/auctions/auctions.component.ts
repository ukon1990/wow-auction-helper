import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuctionService } from '../../services/auctions';
import { ItemService } from '../../services/item';
import { Title }     from '@angular/platform-browser';

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
	private apiToUse = user.apiToUse;

	// Objects and arrays
	private user: IUser;
	private itemClasses = {};
	private selectedItem = {'name': 'No item selected', 'auctions': []};
	private selectedAuctions = [];

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
	private currentAuctionPage: number = 1;
	private numOfAuctionPages: number = this.numberOfAuctions / this.limit;
	private hasLoaded = false;

	private buyOutAsc: boolean = true;

	constructor(
		private router: Router,
		private titleService: Title,
		private auctionService: AuctionService,
		private itemService: ItemService,
		private formBuilder: FormBuilder) {
		this.user = user;
		this.filteredAuctions = lists.auctions;
		this.itemClasses = itemClasses;
		let filter = JSON.parse(localStorage.getItem('query_auctions')) || undefined;
		if(filter !== undefined) {
			this.filter = filter.filter;
		}
		this.filterForm = formBuilder.group({
			'searchQuery': filter !== undefined ? filter.searchQuery : '',
			'filterByCharacter': this.filterByCharacter,
			'onlyCraftables': this.onlyCraftables,
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

	getIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		try {
			if (auction.petSpeciesId !== undefined && lists.pets !== undefined) {
				if (lists.pets[auction.petSpeciesId] === undefined) {
					getPet(auction.petSpeciesId);
				}
				icon = lists.pets[auction.petSpeciesId].icon;
			} else {
				icon = lists.items[auction.item].icon;
			}
		} catch(err) {console.log(err,auction);}

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

	changeAuctionPage(change: number): void {
		if (change > 0 && this.currentAuctionPage <= this.numOfAuctionPages) {
			this.currentAuctionPage++;
		} else if (change < 0 && this.currentAuctionPage > 1) {
			this.currentAuctionPage--;
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
			scanList,
			petsAdded = {};
		this.searchQuery = this.filterForm.value['searchQuery'];
		this.filterByCharacter = this.filterForm.value['filterByCharacter'];
		this.onlyCraftables = this.filterForm.value['onlyCraftables'];
		this.filter = {
			'itemClass': this.filterForm.value['itemClass'],
			'itemSubClass': this.filterForm.value['itemSubClass']
		};

		localStorage.setItem(
			'query_auctions',
			JSON.stringify(
				{'searchQuery': this.searchQuery, 'demand': demand,
					'mktPrice': mktPrice, 'filter': this.filter, 'onlyVendorSellable': onlyVendorSellable}));
		this.numberOfAuctions = 0;
		this.currentPage = 1;
		this.filteredAuctions = [];


		// If the list filter is set to battlepet, we  need to open all the "Pet cages"
		if(this.filter.itemClass === '1') {
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
				if (this.isTypeMatch(lists.items[this.filter.itemClass === '1' ? 82800 : id]) && match) {
					match = true;
				} else {
					match = false;
				}

				if (match && this.searchQuery.length !== 0 && this.searchQuery.length > 0) {
					// Matching against item name
					if (scanList[id].name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1) {
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
						if(scanList[id].buyout < scanList[id].vendorSell) {
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

	selectAuction(auctions): void {
		if(auctions.petAuctions !== undefined) {
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

	buyoutVersusMarketValue(auction) {
		if(auction.mktPrice === 0) {
			return 0;
		}
		return Math.round((auction.buyout / auction.mktPrice) * 100);
	}

	saveSettings(): void {
		localStorage.setItem('region', user.region);
		localStorage.setItem('realm', user.realm);
		localStorage.setItem('charater', user.character);
	}
}
