import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material';
import { ParentAuctionComponent } from '../auctions/parent.auctions.component';
import { calcCost, user, lists, getPet } from '../../utils/globals';
import { itemClasses } from '../../utils/objects';
import { ItemService } from '../../services/item';
import { Title } from '@angular/platform-browser';
import { IUser, IAuction } from '../../utils/interfaces';
import { Disenchanting } from '../../utils/disenchanting';

declare const ga: Function;
@Component({
	selector: 'app-crafting',
	templateUrl: 'crafting.component.html',
	styleUrls: ['../auctions/auctions.component.css', './crafting.component.css']
})

export class CraftingComponent extends ParentAuctionComponent implements OnInit {
	Disenchanting: Disenchanting;
	isDisenchating = false;
	disenchants = [];
	crafts = [];
	myRecipes = [];
	shoppingCart = { 'recipes': [], 'reagents': [], 'cost': 0, 'buyout': 0, 'profit': 0 };
	selectedItemIndex = -1;
	reagentIndex = 0;

	sortAsc = false;
	buyoutLimit = user.buyoutLimit;
	professions = [
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
	craftManually = ['Choose manually', 'None', 'Only if it\'s cheaper', 'Do it for everything!'];
	sortProfitBy = 'g';

	private isInitiated = false;

	constructor(private itemService: ItemService, private titleService: Title, private formBuilder: FormBuilder) {
		super();
		this.Disenchanting = new Disenchanting(true);
		const query = localStorage.getItem('query_crafting') === null ? undefined : JSON.parse(localStorage.getItem('query_crafting'));

		if (query !== undefined) {
			this.isDisenchating = query.isDisenchating ? query.isDisenchating : false;
			this.Disenchanting.onlyProfitable = query.onlyProfitable ? query.onlyProfitable : false;
			this.Disenchanting.selected = query.selectedDisenchanting ? query.selectedDisenchanting : 0;
		}

		this.filterForm = formBuilder.group({
			'searchQuery': query && query.searchQuery !== undefined ? query.searchQuery : '',
			'onlyMyRecipes': query && query.onlyMyRecipes !== undefined ? query.onlyMyRecipes : true,
			'profession': query && query.profession ? query.profession : 'All',
			'profit': query && query.profit !== null ? parseFloat(query.profit) : 0,
			'demand': query && query.demand !== null ? parseFloat(query.demand) : 0,
			'minSold': query && query.minSold !== null ? parseFloat(query.minSold) : 0,
			'craftManually': query && query.craftManually !== null ? query.craftManually : this.craftManually[0],
			'selectedDEMaterial': query && query.selectedDisenchanting ? query.selectedDisenchanting : 0,
			'DEOnlyProfitable': query && query.onlyProfitable ? query.onlyProfitable : false
		});
		const sc = localStorage.getItem('shopping_cart');
		if (sc !== null && sc !== undefined && sc !== 'undefined') {
			this.shoppingCart = JSON.parse(sc);
		}
		lists.myRecipes.forEach( recipeID => {
			this.myRecipes[recipeID] = 'owned';
		});
		this.titleService.setTitle('Wah - Crafting');
	}

	ngOnInit() {
		if (lists.customPrices === undefined) {
			lists.customPrices = [];
		} else {
			Object.keys(lists.customPrices).forEach(k => {
				if (lists.items[k] === undefined) {
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

		const refreshId = setInterval(() => {
			try {
				if (!lists.isDownloading && lists.auctions.length > 0) {
					this.setShoppingCartCost();
					clearInterval(refreshId);
				}
			} catch (e) {
				console.log(e);
			}
		}, 100);
		this.checkForMissingRecipes();
	}

	getApiItem(itemID: string) {
		if (user.apiToUse === 'tsm' && lists.tsm[itemID]) {
			return {
				estDemand: lists.tsm[itemID].RegionSaleRate,
				regionSaleAvg: lists.tsm[itemID].RegionSaleAvg,
				avgDailySold: lists.tsm[itemID].RegionAvgDailySold,
				avgDailyPosted: 0,
				mktPrice: lists.tsm[itemID].MarketValue
			};
		} else if (user.apiToUse === 'wowuction' && lists.wowuction[itemID]) {
			// return lists.wowuction[itemID];
			return {
				estDemand: lists.wowuction[itemID].estDemand,
				avgDailySold: lists.wowuction[itemID].avgDailySold,
				avgDailyPosted: lists.wowuction[itemID].avgDailyPosted,
				mktPrice: lists.wowuction[itemID].mktPrice
			};
		}
		return {
			estDemand: 0,
			avgDailySold: 0,
			avgDailyPosted: 0,
			mktPrice: 0
		};
	}

	/**
	 * Applying recipes to list. adding the item filter once auction download is completed
	 */
	setCrafts(): void {
		if (lists.recipes !== undefined) {
			this.crafts = lists.recipes;
			this.numOfPages = Math.ceil(this.crafts.length / this.limit);

			const refreshId = setInterval(() => {
				try {
					if (!lists.isDownloading && lists.auctions.length > 0 && !this.isInitiated) {
						this.isInitiated = true;
						this.filteRecipes();
						clearInterval(refreshId);
					}
				} catch (e) {
					console.log(e);
				}
			}, 100);
		}
	}

	toggleDisenchanting(bool): void {
		this.isDisenchating = bool;
		this.filteRecipes();
	}

	setManualCraft(material, recipe): void {
		material.useCraftedBy = !material.useCraftedBy;
		console.log(material.name + ' using manual craft ' + material.useCraftedBy);
		this.updateCraftingCost(recipe);
	}

	updateCraftingCost(recipe) {
		calcCost(recipe);
		recipe.reagents.forEach(reagent => {
			if (reagent.createdBy !== undefined && lists.recipes[lists.recipesIndex[reagent.createdBy]] === undefined) {
				delete reagent.createdBy;
				delete reagent.useCraftedBy;
			}
		});
	}

	/**
	 * Filtering the craftables by user query
	 */
	filteRecipes(): void {
		this.crafts = [];
		let isAffected = false,
			match = false;
		const searchQuery = this.filterForm.value['searchQuery'],
			onlyMyRecipes = this.filterForm.value['onlyMyRecipes'],
			profession = this.filterForm.value['profession'],
			profit = this.filterForm.value['profit'] || 0,
			demand = this.filterForm.value['demand'] || 0,
			minSold = this.filterForm.value['minSold'] || 0,
			craftManually = this.filterForm.value['craftManually'] || 0;

		this.Disenchanting.onlyProfitable = this.filterForm.value['DEOnlyProfitable'];
		this.Disenchanting.selected = parseInt(this.filterForm.value['selectedDEMaterial'], 10);

		localStorage.setItem(
			'query_crafting',
			JSON.stringify(
				{
					searchQuery: searchQuery, onlyMyRecipes: onlyMyRecipes, profession: profession,
					profit: profit, demand: demand, minSold: minSold, craftManually: craftManually,
					isDisenchating: this.isDisenchating, onlyProfitable: this.Disenchanting.onlyProfitable,
					selectedDisenchanting: this.Disenchanting.selected
				}));

		if (this.isDisenchating) {
			ga('send', {
				hitType: 'event',
				eventCategory: 'Crafting',
				eventAction: 'Filtering',
				eventLabel: 'Disenchanting'
			});
			this.Disenchanting.applyFilter(onlyMyRecipes, this.myRecipes, profession);

			this.pageEvent.pageIndex = 0;
			return;
		} else {
			ga('send', {
				hitType: 'event',
				eventCategory: 'Crafting',
				eventAction: 'Filtering',
				eventLabel: 'Crafting'
			});
			lists.recipes.forEach(r => {
				isAffected = false;
				// Checking if there are any items missing in the DB
				if (lists.items[r.itemID] === undefined) {
					/*console.log('Importing item ' + r.name + '(' + r.itemID + ')');
					this.itemService.getItem(r.itemID).subscribe(i => {
						lists.items[r.itemID] = i;
						console.log(r.itemID + ' added');
					});*/
				}

				try {
					if (profession === 'All') {
						match = true;
					} else if (profession === r.profession) {
						match = true;
					} else {
						match = false;
					}

					if (this.myRecipes.length > 0 && match && onlyMyRecipes) {
						if (this.myRecipes[r.spellID]) {
							match = true;
						} else {
							match = false;
						}
					}

					if (match && searchQuery.length > 0) {
						// Matching against item name
						if (searchQuery.length !== 0 && match) {
							// TODO: Used to use getItemName()
							if (r.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1) {
								match = true;
							} else {
								match = false;
							}
						}
					}

					if (match && (profit === 0 || profit <= this.getProfitPercent(r.profit, r.buyout))) {
						match = true;
					} else {
						match = false;
					}

					if (user.apiToUse === 'tsm' || user.apiToUse === 'wowuction') {
						try {
							if (match && (minSold === 0 || minSold <= this.getApiItem(r.itemID).avgDailySold)) {
								match = true;
							} else {
								match = false;
							}

							if (match && (demand === 0 || demand <= this.getApiItem(r.itemID).estDemand * 100)) {
								match = true;
							} else {
								match = false;
							}
						} catch (error) {
							console.log('Filtering for api related filters failed', error);
						}
					}

					if (match) {
						let localMatch;
						r.reagents.forEach(reagent => {
							localMatch = true;
							if (reagent.createdBy !== undefined && lists.recipes[lists.recipesIndex[reagent.createdBy]] === undefined) {
								delete reagent.createdBy;
								delete reagent.useCraftedBy;
							} else if (lists.recipes[lists.recipesIndex[reagent.createdBy]] !== undefined) {
								switch (craftManually) {
									// ['Choose manually', 'None', 'Only if it\'s cheaper', 'Do it for everything!']
									case this.craftManually[1]:
										// Disable
										reagent.useCraftedBy = false;
										isAffected = true;
										break;
									case this.craftManually[2]:
										// If cheaper
										if (lists.recipes[lists.recipesIndex[reagent.createdBy]].cost > 0 &&
											lists.recipes[lists.recipesIndex[reagent.createdBy]].cost < (reagent.count * this.getMinPrice(reagent.itemID))) {

											// Verifying that it is @ AH
											lists.recipes[lists.recipesIndex[reagent.createdBy]].reagents.forEach(r => {
												localMatch = lists.auctions[r.itemID] && lists.auctions[r.itemID].quantity_total >= r.count;
											});
											if (localMatch) {
												reagent.useCraftedBy = true;
												isAffected = true;
											} else {
												reagent.useCraftedBy = false;
												isAffected = true;
											}
										} else {
											reagent.useCraftedBy = false;
											isAffected = true;
										}
										break;
									case this.craftManually[3]:
										// For everything
										reagent.useCraftedBy = true;
										break;
								}
							}
						});
						this.updateCraftingCost(r);
						this.crafts.push(r);
					}
				} catch (err) {
					console.log(err);
					ga('send', {
						hitType: 'event',
						eventCategory: 'Crafting',
						eventAction: 'Filter error',
						eventLabel: err
					});
				}
			});
			this.pageEvent.pageIndex = 0;
		}
	}

	/**
	 * Used for fetching the sub reagents of a recipe
	 * @param  {object} material Reagent object
	 * @return {object}          List of reagents
	 */
	getSubMaterials(material) {
		return lists.recipes[lists.recipesIndex[material.createdBy]].reagents;
	}

	/**
	 * Retrieves an auction item.
	 * @param  {string} itemID
	 * @return {Item}
	 */
	getAuction(itemID: string) {
		if (lists.auctions[itemID] !== undefined) {
			return lists.auctions[itemID];
		} else if (user.apiToUse === 'tsm' && lists.tsm[itemID] !== undefined) {
			return {
				'name': lists.tsm[itemID].name,
				'estDemand': lists.tsm[itemID].RegionSaleRate,
				'avgDailySold': lists.tsm[itemID].RegionAvgDailySold,
				'avgDailyPosted': Math.round(
					(parseFloat(lists.tsm[itemID]['RegionAvgDailySold']) / parseFloat(lists.tsm[itemID]['RegionSaleRate'])) * 100) / 100 || 0,
				'regionSaleAvg': lists.tsm[itemID].RegionSaleAvg,
				'quantity_total': 0
			};
		} else {
			return { 'name': 'loading', 'estDemand': 0, 'avgDailySold': 0, 'avgDailyPosted': 0, 'quantity_total': 0 };
		}
	}

	/**
	 * Checks if an item is @ AH or not.
	 * @param  {string}  itemID
	 * @return {boolean}        Availability
	 */
	isAtAH(itemID: string): boolean {
		return lists.auctions[itemID] !== undefined ? true : false;
	}

	/**
	 * Finds the minimum price for an item
	 * @param  {string} itemID
	 * @return {number}
	 */
	getMinPrice(itemID: string): number {
		try {
			if (lists.customPrices[itemID]) {
				return lists.customPrices[itemID];
			}
			return lists.auctions[itemID].buyout;
		} catch (e) {
			if (user.apiToUse === 'wowuction' && lists.wowuction[itemID] !== undefined) {
				return lists.wowuction[itemID]['mktPrice'];
			} else if (user.apiToUse === 'tsm' && lists.tsm[itemID] !== undefined) {
				return lists.tsm[itemID].MarketValue;
			}
			return 0;
		}
	}

	/**
	 * Calculating potential profit
	 * @param  {number} profit
	 * @param  {number} buyout
	 * @return {number}
	 */
	getProfitPercent(profit: number, buyout: number): number {
		return Math.round((profit / buyout) * 100);
	};

	/**
	 * Gets thre auction item for an item
	 * @param  {string} itemID
	 * @return {object}
	 */
	getAuctionItem(itemID: string) {
		if (lists.auctions[itemID] === undefined) {
			return { 'quantity_total': 0 };
		}
		return lists.auctions[itemID];
	}

	openMenu(index: number): void {
		if (this.selectedItemIndex === index) {
			this.selectedItemIndex = -1;
			return;
		}
		this.selectedItemIndex = index;
	}

	/**
	 * Adds an item to a shopping cart
	 * @param {object} recipe
	 */
	addToCart(recipe, quantity?: number): void {
		if (!quantity) {
			quantity = 1;
		}

		for (let i = 0; i < quantity; i++) {
			if (this.shoppingCart.recipes.length === 0 || !this.keyValueInArray(this.shoppingCart.recipes, 'spellID', recipe.spellID)) {
				this.shoppingCart.recipes.push({
					'name': recipe.name, 'spellID': recipe.spellID, 'itemID': recipe.itemID,
					'quantity': 1, 'minCount': recipe.minCount, 'reagents': recipe.reagents
				});
			} else {
				this.shoppingCart.recipes[this.reagentIndex].quantity += 1;
			}

			this.addReagentToCart(recipe);
			this.setShoppingCartCost();
			localStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCart));
		}
		ga('send', {
			hitType: 'event',
			eventCategory: 'Crafting',
			eventAction: 'Shopping cart',
			eventLabel: `${quantity} item(s) added for disenchanting = ${this.isDisenchating}`
		});
	}

	/**
	 * Adds a reagent to the shopping cart
	 * @param {object} recipe
	 */
	addReagentToCart(recipe): void {
		recipe.reagents.forEach(r => {
			if (this.keyValueInArray(this.shoppingCart.reagents, 'itemID', r.itemID)) {
				if (r.useCraftedBy) {
					for (let i = 0, x = parseFloat(r.count); i < x; i++) {
						this.addToCart(lists.recipes[lists.recipesIndex[r.createdBy]]);
					}
				} else {
					this.shoppingCart.reagents[this.reagentIndex].count += parseFloat(r.count);
					this.shoppingCart.reagents[this.reagentIndex].count = Math.round(this.shoppingCart.reagents[this.reagentIndex].count * 100) / 100;
				}
			} else {
				if (r.useCraftedBy) {
					for (let i = 0, x = parseFloat(r.count); i < x; i++) {
						this.addToCart(lists.recipes[lists.recipesIndex[r.createdBy]]);
					}
				} else {
					this.shoppingCart.reagents.push({ 'itemID': r.itemID, 'name': r.name, 'count': parseFloat(r.count), 'useCraftedBy': r.useCraftedBy });
				}
			}
		});
	}

	/**
	 * Removes a recipe and it's reagents from the shopping cart
	 * @param {string} spellID
	 */
	removeFromCart(spellID: string): void {
		console.log('Removed ' + spellID);
		let recipeIndex = 0,
			reagentRemoveList = [],
			recipe = {};
		// Fetching the recipe's index key
		if (this.keyValueInArray(this.shoppingCart.recipes, 'spellID', spellID)) {
			recipeIndex = this.reagentIndex;
			recipe = this.shoppingCart.recipes[recipeIndex];
		}

		// Removing reagents
		recipe['reagents'].forEach(r => {
			if (this.keyValueInArray(this.shoppingCart.reagents, 'itemID', r.itemID)) {
				this.shoppingCart.reagents[this.reagentIndex].count -= (parseFloat(r.count) * recipe['quantity']);
				if (this.shoppingCart.reagents[this.reagentIndex].count <= 0) {
					this.shoppingCart.reagents.splice(this.reagentIndex, 1);
				}
			}
		});

		// Removing recipe and storing changes
		this.shoppingCart.recipes.splice(recipeIndex, 1);
		this.setShoppingCartCost();
		localStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCart));
	}

	/**
	 * Clears the shopping cart
	 */
	clearCart(): void {
		this.shoppingCart.reagents = [];
		this.shoppingCart.recipes = [];
		this.shoppingCart.buyout = 0;
		this.shoppingCart.profit = 0;
		this.shoppingCart.cost = 0;
		localStorage.setItem('shopping_cart', JSON.stringify(this.shoppingCart));
	}

	/**
	 * Calculates the cost of the shopping cart
	 */
	setShoppingCartCost(): void {
		this.shoppingCart.buyout = 0;
		this.shoppingCart.cost = 0;

		this.shoppingCart.recipes.forEach(v => {
			this.shoppingCart.buyout += this.getMinPrice(v.itemID) * v.quantity;

			v.reagents.forEach(reagent => {
				if (reagent.useCraftedBy) {
					this.shoppingCart.buyout -= (this.getMinPrice(reagent.itemID) * parseFloat(reagent.count)) * v.quantity;
				}
			});
		});

		this.shoppingCart.reagents.forEach(v => {
			this.shoppingCart.cost += this.getMinPrice(v.itemID) * v.count;
		});

		this.shoppingCart.profit = this.shoppingCart.buyout - this.shoppingCart.cost;
	}

	/**
	 * Gets the percent diff between two values
	 * @param  {number} val1
	 * @param  {number} val2
	 * @return {number}
	 */
	percentOf(val1: number, val2: number): number {
		if (val1 === 0) {
			return 0;
		}
		return Math.round((val2 / val1) * 100);
	}

	/**
	 * Checks if a key exists in an array
	 * @param  {[object]}  array [description]
	 * @param  {string}  key   [description]
	 * @param  {any}  value    The value we are looking for
	 * @return {boolean}
	 */
	keyValueInArray(array, key: string, value): boolean {
		let contains = false, index = 0;
		array.forEach(o => {
			if (o[key] === value) {
				contains = true;
				this.reagentIndex = index;
			}
			index++;
		});
		return contains;
	}

	getName(recipe: any): any {
		return lists.items[recipe.itemID] ? lists.items[recipe.itemID].name : recipe.name;
	}

	checkForMissingItems(): void {
		let missingItems = [];
		console.log('Building missing item list');
		lists.recipes.forEach(r => {
			if (!lists.items[r.itemID]) {
				missingItems[r.itemID] = r.name;
			}
			r.reagents.forEach(m => {
				if (!lists.items[m.itemID]) {
					console.log('s');
					missingItems[m.itemID] = r.name;
				}
			});
		});

		/*
		this.itemService.getItem(m.itemID).subscribe(result => {
			console.log(result);
		});
		*/
		console.log('Missing items:', missingItems);
	}

	/**
	 * Checks if there are any recipes the user know, that are missing
	 * in the database.
	 */
	checkForMissingRecipes(): void {
		if (this.myRecipes.length > 0 && !lists.isDownloading) {
			let missingRecipes = [], list = '';

			Object.keys(this.myRecipes).forEach(k => {
				if (!lists.recipesIndex[k] && !missingRecipes[k]) {
					missingRecipes[k] = k;
					list += `${k}, `;

					this.itemService.getRecipeBySpell(k)
						.subscribe(recipe => {
							lists.recipesIndex[k] = recipe.spellID;
							lists.recipes.push(recipe);
						});
				}
			});

			console.log('Missing recipes:', list);
		}
	}
}
