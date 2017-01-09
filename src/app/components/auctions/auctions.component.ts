import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuctionService } from '../../services/auctions';
import { ItemService } from '../../services/item';

import { user, itemClasses, lists } from '../../utils/globals';
import { IUser, IAuction } from '../../utils/interfaces';

declare var $WowheadPower;
let auctions = [];
let itemList = {};
let petList = [];

@Component({
	selector: 'auctions',
	templateUrl: 'auctions.component.html',
	styleUrls: ['auctions.component.css'],
	providers: [AuctionService, ItemService]
})

export class AuctionComponent {
	//Strings
	private title = 'Auctions';
	private searchQuery = '';
	private filterByCharacter = false;
	private onlyCraftables = false;
	private filter = { 'itemClass': '-1', 'itemSubClass': '-1' };
	private filterForm: FormGroup;

	//Objects and arrays
	private user: IUser;
	private itemClasses = {};
	private auctionObserver = {};
	private itemObserver = {};
	private petObserver = {};
	private auctionDuration = {
		'VERY_LONG': '12h+',
		'LONG': '2-12h',
		'MEDIUM': '30min-2h',
		'SHORT': '<30min'
	}
	private filteredAuctions = [];

	//Numbers
	private limit: number = 10;//per page
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
		if (auctions !== undefined && auctions.length === 0) {
			this.petObserver = this.itemService.getPets()
				.subscribe(pets => {
					this.buildPetArray(pets['pets']);
				});
			this.itemObserver = this.itemService.getItems()
				.subscribe(
				i => {
					this.buildItemArray(i)
				}
				);
		} else {
			this.filterAuctions();
		}
	}

	changePage(change: number): void {
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}

	getItemIcon(auction): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		if (auction.petSpeciesId !== undefined) {
			if (petList[auction.petSpeciesId] === undefined) {
				this.getPet(auction.petSpeciesId);
			}
			icon = petList[auction.petSpeciesId].icon;
		} else {
			icon = itemList[auction.item].icon;
		}
		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}

	getToolTip(itemID: string) {
		if (itemList[itemID]['description'] === undefined) {
			this.getItem(itemID);
		}
	}

	getType(s) {
		return typeof s;
	}

	getDescription(itemID: string): string {
		let item = itemList[itemID];
		if (item['description'] !== undefined && item['description'].length > 0) {
			return item['description'];
		} else if (item['itemSpells'] !== undefined) {
			let itemSpells = item['itemSpells'];
			if (itemSpells.length > 0) {
				return itemSpells[0]['spell']['description'];
			}
		}
	}

	getNumOfPages() {
		this.numOfPages = this.numberOfAuctions / this.limit;
		return Math.round(this.numOfPages);
	}

	clearFilters(): void {
		this.filterForm.value['searchQuery'] = '';
		this.filterForm.value['filterByCharacter'] = false;
		this.filterForm.value['itemClass'] = '-1';
		this.filterForm.value['itemSubClass'] = '-1';

		this.filterAuctions();
	}

	filterAuctions(): void {
		// From form
		this.searchQuery = this.filterForm.value['searchQuery'];
		this.filterByCharacter = this.filterForm.value['filterByCharacter'];
		this.onlyCraftables = this.filterForm.value['onlyCraftables'];
		this.filter = {
			'itemClass': this.filterForm.value['itemClass'],
			'itemSubClass': this.filterForm.value['itemSubClass']};

		this.numberOfAuctions = 0;
		this.currentPage = 1;
		this.filteredAuctions = [];

		for (let a of auctions) {
			let match = true;
			// Matching against item type
			if (this.isTypeMatch(itemList[a.item]) && match) {
				match = true;
			} else {
				match = false;
			}

			if (this.filterByCharacter || this.searchQuery.length > 0 || this.onlyCraftables) {
				// Matching against item name
				if (this.searchQuery.length !== 0 && match) {
					// TODO: Used to use getItemName()
					if (a.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1) {
						match = true;
					} else {
						match = false;
					}
				}

				// Matching against auction owner
				if (this.filterByCharacter && match) {
					try{
						match = a.owner.toString().toLowerCase() === user.character.toLowerCase();
					}catch(err){ match = false;}
				}
				// Item source
				if (this.onlyCraftables && match) {
					match = itemList[a.item]['itemSource'] !== undefined &&
							itemList[a.item]['itemSource']['sourceType'] === 'CREATED_BY_SPELL';
				}
			}
			if (match) {
				this.numberOfAuctions++;
				this.filteredAuctions.push(a);
			}
		}
	}

	isTypeMatch(item): boolean {
		let match: boolean = false;
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

	buildItemArray(arr) {
		for (let i of arr) {
			itemList[i['id']] = i;
			if(i['itemSource'].length > 0){
				i['itemSource'].forEach(sid => {
					if(sid['sourceType'] === 'CREATED_BY_SPELL') {
						console.log('Item: ' + i['name'] + ' -> ' + sid['sourceId']);
					}
				});
			}
		}
		this.getAuctions();
	}

	getAuctions(): void {
		console.log('Loading auctions');
		this.auctionObserver = this.auctionService.getAuctions()
			.subscribe(
			r => {
				this.buildAuctionArray(r.auctions)
			}
			);
	}

	getItemName(auction): string {
		let itemID = auction.item;
		if (auction.petSpeciesId !== undefined) {
			auction['name'] = this.getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
			return this.getPet(auction.petSpeciesId) + ' @' + auction.petLevel;
		} else {
			if (itemList[itemID] !== undefined) {
				if (itemList[itemID]['name'] === 'Loading') {
					this.getItem(itemID);
				}
				return itemList[itemID]['name'];
			}
		}
		return 'no item data';
	}

	getPet(speciesId) {
		if (petList[speciesId] === undefined) {
			petList[speciesId] = {
				"speciesId": speciesId,
				"petTypeId": 0,
				"creatureId": 54730,
				"name": "Loading",
				"icon": "spell_shadow_summonimp",
			};
			this.petObserver = this.itemService.getPet(speciesId).subscribe(
				r => {
					petList[speciesId] = r;
					console.log(r);
				}
			);
		}
		return petList[speciesId].name;
	}

	buildAuctionArray(arr) {
		let list = [];
		for (let o of arr) {
			this.numberOfAuctions++;
			if (itemList[o.item] === undefined) {
				itemList[o.item] = { 'id': o.item, 'name': 'Loading', 'icon': '' };
				o['name'] = 'Loading';
				//this.getItem(o.item);
			} else {
				o['name'] = itemList[o.item].name;
			}
			if (o.petSpeciesId !== undefined) {
				if (petList[o.petSpeciesId] === null) {
					this.getPet(o.petSpeciesId);
				}
				o['name'] = this.getItemName(o);
			}
			list.push(o);
		}
		auctions = list;
		this.filterAuctions();
	}

	buildPetArray(pets) {
		let list = [];
		pets.forEach(p => {
			list[p.speciesId] = p;
		});
		petList = list;
	}

	getSize(list): number {
		let count = 0;
		for (let c of list) {
			count++;
		}
		return count;
	}

	getItem(id) {
		this.itemObserver = this.itemService.getItem(id)
			.subscribe(
			r => itemList[r['id']] = r
			);
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
			auctions.sort(
				function (a, b) {
					if (a[sortBy] / a['quantity'] < b[sortBy] / a['quantity']) {
						return 1;
					}
					return -1;
				}
			);
		} else {
			this.buyOutAsc = true;
			auctions.sort(
				function (a, b) {
					if (a[sortBy] / a['quantity'] > b[sortBy] / a['quantity']) {
						return 1;
					}
					return -1;
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
