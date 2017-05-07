import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { user, lists, db, copperToArray } from '../../utils/globals';
import dexie from 'dexie';

@Component({
	selector: 'app-watchlist',
	templateUrl: './watchlist.component.html',
	styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
	copperToArray = copperToArray;
	queryItems = [];
	itemSearchForm: FormGroup;
	recipeSearchForm: FormGroup;
	groupForm: FormGroup;
	watchlist = {recipes: [], items: [], groups: []};
	display = {
		itemSearch: true,
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
		if (user.watchlist.items) {
			Object.keys(user.watchlist.items).forEach(k => {
				this.watchlist.items.push(user.watchlist.items[k]);
			});
		}
		if (user.watchlist.recipes) {
			Object.keys(user.watchlist.recipes).forEach(k => {
				this.watchlist.recipes.push(user.watchlist.recipes[k]);
			});
		}
		if (user.watchlist.groups) {
			Object.keys(user.watchlist.groups).forEach(k => {
				this.watchlist.groups.push(k);
			});
		}
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
	 * Adds an item to the watchlist
	 * @param  {object} item
	 */
	addItemToWatchlist(item): void {
		try {
			const watch = {id: item.id, name: item.name, compareTo: 'buyout', belowValue: item.value};
			this.watchlist.items.push(watch);
			user.watchlist.items[item.id] = watch;
			this.saveWatchList();
		} catch (error) {
			console.log('Add item to watchlist faild:', error);
		}
	}

	getItemWatchlist() {
		return user.watchlist.items;
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
		localStorage.setItem('watchlist', JSON.stringify(user.watchlist));
	}

	addGroup(): void {
		this.watchlist.groups.push(this.groupForm.value['name']);
		user.watchlist.groups[this.groupForm.value['name']] = this.groupForm.value['name'];
		this.saveWatchList();
	}
}
