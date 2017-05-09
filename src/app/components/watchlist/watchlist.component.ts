import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { IUser } from '../../utils/interfaces';
import { calcCost, user, lists, db, copperToArray } from '../../utils/globals';
import dexie from 'dexie';

declare var $;
@Component({
	selector: 'app-watchlist',
	templateUrl: './watchlist.component.html',
	styleUrls: ['./watchlist.component.css', '../auctions/auctions.component.css']
})
export class WatchlistComponent implements OnInit {
	copperToArray = copperToArray;
	queryItems = [];
	myRecipes = [];
	user: IUser;
	itemSearchForm: FormGroup;
	recipeSearchForm: FormGroup;
	groupForm: FormGroup;
	editing = {
		item: undefined,
		recipe: {
			index: undefined,
			group: undefined
		},
		group: {
			index: undefined,
			newIndex: undefined
		}
	};
	watchlist = { recipes: {}, items: {}, groups: ['Ungrouped'] };
	display = {
		groups: false,
		toggleGroups: () => {
			this.display.groups = !this.display.groups;
		},
		itemSearch: false,
		toggleSearchItem: () => {
			this.display.itemSearch = !this.display.itemSearch;
		},
		recipeSearch: false,
		toggleSearchRecipe: () => {
			this.display.recipeSearch = !this.display.recipeSearch;
		}
	};

	constructor(private formBuilder: FormBuilder, private titleService: Title) {
		this.groupForm = formBuilder.group({
			'name': ''
		});
		this.recipeSearchForm = formBuilder.group({
			'searchQuery': ''
		});
		this.itemSearchForm = formBuilder.group({
			'searchQuery': ''
		});
		this.titleService.setTitle('Wah - Watchlist');
	}

	ngOnInit() {
		this.searchItemDB();
		this.watchlist.groups = user.watchlist.groups;
		this.watchlist.items = user.watchlist.items;
		this.watchlist.recipes = user.watchlist.recipes;
		this.user = user;
		lists.myRecipes.forEach( recipeID => {
			this.myRecipes[recipeID] = 'owned';
		});
	}

	/**
	 * Used to search for items in the indexedDB
	 */
	searchItemDB(): void {
		db.table('items')
			.where('name')
			.startsWithIgnoreCase(this.itemSearchForm.value['searchQuery'])
			.limit(5)
			.toArray()
			.then(i => {
				i.forEach(item => {
					item['value'] = 0;
				});
				this.queryItems = i;
			}, e => {
				console.log(e);
			});
	}

	/**
	 * Used for searching for items in an array
	 */
	searchRecipes(): void {
		console.log('Searching for recipes!');
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
	 * Adds an item to the watchlist
	 * @param  {object} item
	 */
	addItemToWatchlist(item): void {
		try {
			const watch = {
				id: item.id,
				name: item.name,
				compareTo: 'buyout',
				belowValue: item.value,
				group: item.group
			};
			if (!this.watchlist.items[item.group]) {
				this.watchlist.items[item.group] = [];
			}
			this.watchlist.items[item.group].push(watch);
			this.saveWatchList();
		} catch (error) {
			console.log('Add item to watchlist faild:', error);
		}
	}

	getAuctionItem(itemID: string) {
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
	getItemRecipes(itemID: string): any {
		if (lists.itemRecipes[itemID]) {
			return lists.itemRecipes[itemID];
		}
		return undefined;
	}

	getUserRecipesForItem(itemID: string) {
		const userRecipes = [];
		if (lists.itemRecipes[itemID]) {
			lists.itemRecipes[itemID].forEach(r => {
				if (this.myRecipes[r]) {
					userRecipes.push(
						lists.recipes[lists.recipesIndex[r]]
					);
				}
			});
		}
		return userRecipes;
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
	 * Used for fetching the sub reagents of a recipe
	 * @param  {object} material Reagent object
	 * @return {object}          List of reagents
	 */
	getSubMaterials(material) {
		return lists.recipes[lists.recipesIndex[material.createdBy]].reagents;
	}

	/**
	 * Gets the buyout value of an item
	 * @param  {string} itemID
	 * @return {number}
	 */
	getBuyout(itemID: string): number {
		if (!lists.auctions[itemID]) {
			return 0;
		}
		return lists.auctions[itemID].buyout;
	}

	saveWatchList(): void {
		user.watchlist = this.watchlist;
		localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
	}

	addGroup(): void {
		this.watchlist.groups.push(this.groupForm.value['name']);
		this.saveWatchList();
	}

	/**
	 * Used to remove groups, but shall not delete groups with items.
	 * if a group has an item, it should open a dialog window.
	 * @param {number} index The index of the group to remove.
	 */
	removeGroup(index: number): void {
		if (this.watchlist.items[this.watchlist.groups[index]] &&
			this.watchlist.items[this.watchlist.groups[index]].length > 0) {
			this.openRemoveGroupDialog(index);
			console.log(`There are ${this.watchlist.items[this.watchlist.groups[index]].length} items in this group!`);
		} else {
			console.log(index);
			this.watchlist.groups.splice(index, 1);
			this.saveWatchList();
		}
	}

	removeGroupWithItems(doDelete: boolean, newIndex, oldIndex: number): void {
		console.log(doDelete, newIndex, oldIndex);
		newIndex = parseInt(newIndex, 10);
		if (!doDelete) {
			this.watchlist.items[
				this.watchlist.groups[newIndex]]
					.push(this.watchlist.items[
						this.watchlist.groups[
							oldIndex]]);
		}
		delete this.watchlist.items[
			this.watchlist.groups[oldIndex]];

		this.watchlist.groups.splice(oldIndex, 1);
		console.log(this.watchlist.groups);
		// this.saveWatchList();
	}

	openRemoveGroupDialog(index: number): void {
		this.editing.group.index = index;
		$('#group-modal').modal('show');
		$('#group-modal').on('hidden.bs.modal', () => {
			this.editing.group.index = undefined;
			this.editing.group.newIndex = undefined;
		});
	}

	editItemDialog(group: string, index: number): void {
		this.editing.item = this.watchlist.items[group][index];
		$('#item-modal').modal('show');
		$('#item-modal').on('hidden.bs.modal', () => {
			this.editing.item = undefined;
		});
	}

	editItem(group: string, index: number): void {
		// changing group?
		if (this.editing.item.group !== group) {
			if (!this.watchlist.items[this.editing.item.group]) {
				this.watchlist.items[this.editing.item.group] = [];
			}
			this.watchlist.items[this.editing.item.group].push(this.editing.item);
			this.watchlist.items[group].splice(index, 1);
			console.log(this.watchlist.items);
		}
		this.watchlist.items[this.editing.item.group].belowValue = this.editing.item.belowValue;
	}

	removeItem(group: string, index: number): void {
		this.watchlist.items[group].splice(index, 1);
		this.saveWatchList();
	}

	moveGroup(value, positionChange) {
		const oldIndex = this.watchlist.groups.indexOf(value);
		if (oldIndex > -1) {
			let newIndex = (oldIndex + positionChange);

			if (newIndex < 0) {
				newIndex = 0;
			} else if (newIndex >= this.watchlist.groups.length) {
				newIndex = this.watchlist.groups.length;
			}

			const arrayClone = this.watchlist.groups.slice();
			arrayClone.splice(oldIndex, 1);
			arrayClone.splice(newIndex, 0, value);

			this.watchlist.groups = arrayClone;
		}
		this.saveWatchList();
	}

	getIcon(item): string {
		let url = 'http://media.blizzard.com/wow/icons/56/', icon;
		try {
			if (lists.items[item.id] !== undefined) {
				icon = lists.items[item.id].icon;
			}
		} catch (err) {console.log(err, item, item.id); }

		if (icon === undefined) {
			url = 'http://media.blizzard.com/wow/icons/56/inv_scroll_03.jpg';
		} else {
			url += icon + '.jpg';
		}
		return url;
	}
}
