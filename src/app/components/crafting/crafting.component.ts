import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { user, itemClasses, lists, copperToArray, getPet } from '../../utils/globals';
import { ItemService } from '../../services/item';

@Component({
	selector: 'crafting',
	templateUrl: 'crafting.component.html',
	styleUrls: ['../auctions/auctions.component.css']
})
export class CraftingComponent {
	// Strings
	private searchQuery = '';
	private filter = { 'itemClass': '-1', 'itemSubClass': '-1', 'profession': 'All' };
	private filterForm: FormGroup;

	private crafts = [];

	private limit: number = 10;// per page
	private index: number = 0;
	private currentPage: number = 1;
	private numOfPages: number = this.crafts.length / this.limit;
	private sortAsc = false;

	private professions = [
		'First Aid',
		'Blacksmithing',
		'Leatherworking',
		'Alchemy',
		'Cooking',
		'Mining',
		'Tailoring',
		'Engineering',
		'Enchanting',
		'Jewelcrafting',
		'Inscription'
	].sort();

	setCrafts() {
		if (lists.recipes !== undefined) {
			this.crafts = lists.recipes;
			this.numOfPages = this.crafts.length / this.limit;
		}
	}

	constructor(private itemService: ItemService,
		private formBuilder: FormBuilder) {
		this.filterForm = formBuilder.group({
			'searchQuery': '',
			'profession': this.filter.profession,
			'profit': 0,
			'demand': 0,
			'minSold': 0
		});
	}

	ngOnInit() {
		if(lists.customPrices === undefined) {
			lists.customPrices = [];
		}
		try {
			this.setCrafts();
		} catch (e) {
			console.log(e);
		}
	}
	filteRecipes() {
		this.crafts = [];
		this.searchQuery = this.filterForm.value['searchQuery'];
		this.filter.profession = this.filterForm.value['profession'];
		let match = false,
			profit = this.filterForm.value['profit'] || 0,
			demand = this.filterForm.value['demand'] || 0,
			minSold = this.filterForm.value['minSold'] || 0;

		lists.recipes.forEach(r => {
			// Checking if there are any items missing in the DB
			if (lists.items[r.itemID] === undefined) {
				console.log('Importing item ' + r.name + '(' + r.itemID + ')');
				this.itemService.getItem(r.itemID).subscribe(i => {
					lists.items[r.itemID] = i;
					console.log(r.itemID + ' added');
				});
			}

			try {
				if (this.filter.profession === 'All') {
					match = true;
				} else if (this.filter.profession === r.profession) {
					match = true;
				} else {
					match = false;
				}

				if (match && this.searchQuery.length > 0) {
					// Matching against item name
					if (this.searchQuery.length !== 0 && match) {
						// TODO: Used to use getItemName()
						if (r.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1) {
							match = true;
						} else {
							match = false;
						}
					}
				}

				if(match && (minSold === 0 || minSold <= this.getItem(r.itemID).avgDailySold)) {
					match = true;
				} else {
					match = false;
				}

				if (match && (profit === 0 || profit <= this.getProfitPercent(r.profit, r.buyout))) {
					match = true;
				} else {
					match = false;
				}

				if (match && (demand === 0 || demand <= this.getItem(r.itemID).estDemand)) {
					match = true;
				} else {
					match = false;
				}

				if (match) {
					this.crafts.push(r);
				}
			} catch (err) {
				console.log(err);
			}
		});
		this.currentPage = 1;
		this.numOfPages = this.crafts.length / this.limit;
	}

	sortCrafts(sortBy: string) {
		if (this.sortAsc) {
			this.sortAsc = false;
			this.crafts.sort(
				function (a, b) {
					return a[sortBy] - b[sortBy];
				}
			);
		} else {
			this.sortAsc = true;
			this.crafts.sort(
				function (a, b) {
					return b[sortBy] - a[sortBy];
				}
			);
		}
	}

	getItem(itemID) {
		if (lists.auctions[itemID] !== undefined) {
			return lists.auctions[itemID];
		} else {
			return { 'name': 'loading', 'estDemand': 0, 'avgDailySold': 0, 'avgDailyPosted': 0, 'quantity_total': 0 };
		}
	}

	isAtAH(itemID) {
		return lists.auctions[itemID] !== undefined ? true : false;
	}

	getMinPrice(itemID) {
		try {
			return this.goldConversion(lists.auctions[itemID].buyout);
		} catch (e) {
			if(lists.customPrices[itemID] !== undefined) {
				return this.goldConversion(lists.customPrices[itemID]);
			} else if(lists.wowuction[itemID] !== undefined) {
				//console.log(lists.wowuction[itemID]);
				return this.goldConversion(lists.wowuction[itemID]['mktPrice']);
			}
			return '0g 0s 0c';
		}
	}

	getProfitPercent(profit, buyout) {
		return Math.round((profit / buyout) * 100);
	};

	getAuctionItem(itemID) {
		return lists.auctions[itemID];
	}

	goldConversion = copperToArray;


	changePage(change: number): void {
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}

	getIcon(itemID): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon = lists.items[itemID].icon;
		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}
}