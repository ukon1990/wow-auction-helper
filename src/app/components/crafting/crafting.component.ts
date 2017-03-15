import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { user, itemClasses, lists, copperToArray, getPet } from '../../utils/globals';

@Component({
	selector: 'crafting',
	templateUrl: 'crafting.component.html'
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

	private professions = [
		'All',
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
	];

	setCrafts() {
		this.crafts = lists.recipes;
		this.numOfPages = this.crafts.length / this.limit;
	}

	constructor(
		private formBuilder: FormBuilder) {
		this.filterForm = formBuilder.group({
			'searchQuery': '',
			'profession': this.filter.profession,
			'profit': 0,
			'demand': 0
		});
	}

	ngOnInit() {
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
			demand = this.filterForm.value['demand'] || 0;
		console.log(profit, demand);
		lists.recipes.forEach(r => {
			try {
				if (this.filter.profession === 'All') {
					match = true;
				} else if (this.filter.profession === r.profession) {
					match = true;
				} else {
					match = false;
				}

				if(match && (profit === 0 || profit <= this.getProfitPercent(r.profit, r.buyout)) ) {
					match = true;
				} else {
					match = false;
				}

				if(match && (demand === 0 || demand <= this.getItem(r.itemID).estDemand) ) {
					match = true;
				} else {
					match = false;
				}

				if(match) {
					this.crafts.push(r);
				}
			} catch (err) {
				console.log(err);
			}
		});
		this.currentPage = 1;
		this.numOfPages = this.crafts.length / this.limit;
	}

	getItem(itemID) {
		if (lists.auctions[itemID] !== undefined) {
			return lists.auctions[itemID];
		} else {
			return { 'name': 'loading', 'estDemand': 0, 'avgDailySold': 0, 'avgDailyPosted': 0 };
		}
	}

	getMinPrice(itemID) {
		try {
			return this.goldConversion(lists.auctions[itemID].buyout / lists.auctions[itemID].quantity);
		} catch (e) {
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
}