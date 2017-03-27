import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { user, itemClasses, lists, copperToArray, getPet } from '../../utils/globals';
import { ItemService } from '../../services/item';
import { Title }     from '@angular/platform-browser';
import { IUser, IAuction } from '../../utils/interfaces';

declare var $WowheadPower;
declare var $wu;

@Component({
	selector: 'crafting',
	templateUrl: 'crafting.component.html',
	styleUrls: ['../auctions/auctions.component.css']
})
export class CraftingComponent {
	goldConversion = copperToArray;
	// Strings
	private searchQuery = '';
	private filter = { 'itemClass': '-1', 'itemSubClass': '-1', 'profession': 'All' };
	private filterForm: FormGroup;
	private user: IUser;

	private crafts = [];
	private shoppingCart = {'recipes': [], 'reagents': [], 'cost': 0, 'buyout': 0, 'profit': 0};

	private limit: number = 10;// per page
	private index: number = 0;
	private currentPage: number = 1;
	private reagentIndex: number = 0;
	private numOfPages: number = this.crafts.length / this.limit;
	private sortAsc = false;
	private isInitiated = false;
	private apiToUse = user.apiToUse;
	private buyoutLimit = user.buyoutLimit;

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

			let refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0 && !this.isInitiated) {
						this.isInitiated = true;
						this.filteRecipes();
						clearInterval(refreshId);
					}
				} catch(e) {console.log(e);}
			}, 100);
		}
	}

	constructor(private itemService: ItemService, private titleService: Title, private formBuilder: FormBuilder) {
		let query = localStorage.getItem('query_crafting') === null ? undefined : JSON.parse(localStorage.getItem('query_crafting'));
		this.filterForm = formBuilder.group({
			'searchQuery': query !== undefined ? query.searchQuery : '',
			'profession': query !== undefined ? query.profession : this.filter.profession,
			'profit': query !== undefined ? parseFloat(query.profit) : 0,
			'demand': query !== undefined ? parseFloat(query.demand) : 0,
			'minSold': query !== undefined ? parseFloat(query.minSold) : 0
		});
		this.user = user;
		let sc = localStorage.getItem('shopping_cart');
		if(sc !== null && sc !== undefined && sc !== 'undefined') {
			this.shoppingCart = JSON.parse(sc);
		}
		this.titleService.setTitle('Wah - Crafting');
	}

	ngOnInit() {
		if(lists.customPrices === undefined) {
			lists.customPrices = [];
		} else {
			Object.keys(lists.customPrices).forEach( k => {
				if(lists.items[k] === undefined) {
					this.itemService.getItem(k).subscribe(r => {
						lists.items[k] = r;
					}, e => {
						console.log('', e);
					});
				}
			});
		}

		try {
			this.setCrafts();
		} catch (e) {
			console.log(e);
		}

		let refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0) {
						this.setShoppingCartCost();
						clearInterval(refreshId);
					}
				} catch(e) {console.log(e);}
			}, 100);
	}

	filteRecipes() {
		this.crafts = [];
		this.searchQuery = this.filterForm.value['searchQuery'];
		this.filter.profession = this.filterForm.value['profession'];
		let match = false,
			profit = this.filterForm.value['profit'] || 0,
			demand = this.filterForm.value['demand'] || 0,
			minSold = this.filterForm.value['minSold'] || 0;
		localStorage.setItem(
			'query_crafting',
			JSON.stringify(
				{'searchQuery': this.searchQuery, 'profession': this.filter.profession, 'profit': profit, 'demand': demand, 'minSold': minSold}));

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

	getNumOfPages() {
		this.numOfPages = Math.round(this.crafts.length / this.limit);
		return this.numOfPages;
	}

	isAtAH(itemID) {
		return lists.auctions[itemID] !== undefined ? true : false;
	}

	getMinPrice(itemID) {
		try {
			return lists.auctions[itemID].buyout;
		} catch (e) {
			if(lists.customPrices[itemID] !== undefined) {
				return lists.customPrices[itemID];
			} else if(lists.wowuction[itemID] !== undefined) {
				//console.log(lists.wowuction[itemID]);
				return lists.wowuction[itemID]['mktPrice'];
			}
			return 0;
		}
	}

	getProfitPercent(profit, buyout) {
		return Math.round((profit / buyout) * 100);
	};

	getAuctionItem(itemID) {
		if(lists.auctions[itemID] === undefined){
			return {'quantity_total': 0};
		}
		return lists.auctions[itemID];
	}

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

	addToCart(recipe): void {
		if(this.shoppingCart.recipes.length === 0 || !this.keyValueInArray(this.shoppingCart.recipes, 'spellID', recipe.spellID)) {
			this.shoppingCart.recipes.push({
				'name': recipe.name, 'spellID': recipe.spellID, 'itemID': recipe.itemID, 'quantity': 1, 'reagents': recipe.reagents});
		} else {
			this.shoppingCart.recipes[this.reagentIndex].quantity += 1;
		}
		recipe.reagents.forEach(r => {
			if(this.keyValueInArray(this.shoppingCart.reagents, 'itemID', r.itemID)) {
				this.shoppingCart.reagents[this.reagentIndex].count += r.count;
				this.shoppingCart.reagents[this.reagentIndex].count = Math.round(this.shoppingCart.reagents[this.reagentIndex].count * 100) / 100;
			} else {
				this.shoppingCart.reagents.push({'itemID': r.itemID, 'name': r.name, 'count': r.count});
			}
		});

		this.setShoppingCartCost();
		localStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCart));
	}

	removeFromCart(spellID): void {
		console.log('Removed ' + spellID);
		let recipeIndex = 0,
			reagentRemoveList = [],
			recipe = {};
		// Fetching the recipe's index key
		if(this.keyValueInArray(this.shoppingCart.recipes, 'spellID', spellID)) {
			recipeIndex = this.reagentIndex;
			recipe = this.shoppingCart.recipes[recipeIndex];
		}

		// Removing reagents
		recipe['reagents'].forEach(r => {
			if(this.keyValueInArray(this.shoppingCart.reagents, 'itemID', r.itemID)) {
				this.shoppingCart.reagents[this.reagentIndex].count -= (r.count * recipe['quantity']);
				if(this.shoppingCart.reagents[this.reagentIndex].count <= 0) {
					this.shoppingCart.reagents.splice(this.reagentIndex, 1);
				}
			}
		});

		// Removing recipe and storing changes
		this.shoppingCart.recipes.splice(recipeIndex, 1);
		this.setShoppingCartCost();
		localStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCart));
	}

	setShoppingCartCost(): void {
		this.shoppingCart.buyout = 0;
		this.shoppingCart.cost = 0;

		this.shoppingCart.recipes.forEach(v => {
			this.shoppingCart.buyout += this.getMinPrice(v.itemID) * v.quantity;
		});

		this.shoppingCart.reagents.forEach(v => {
			this.shoppingCart.cost += this.getMinPrice(v.itemID) * v.count;
		});

		this.shoppingCart.profit = this.shoppingCart.buyout - this.shoppingCart.cost;
	}

	percentOf(val1, val2) {
		if(val1 === 0) {
			return 0;
		}
		return Math.round((val2 / val1) * 100);
	}

	keyValueInArray(array, key, value): boolean {
		let contains = false, index = 0;
		array.forEach(o => {
			if(o[key] === value ) {
				contains = true;
				this.reagentIndex = index;
			}
			index++;
		});
		return contains;
	}
}