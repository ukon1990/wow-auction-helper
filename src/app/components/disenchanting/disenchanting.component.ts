import { Component, OnInit } from '@angular/core';
import { lists, db, copperToString, getIcon, isAtAH, user, getAuctionItem, getMinPrice } from '../../utils/globals';

@Component({
	selector: 'app-disenchanting',
	templateUrl: './disenchanting.component.html',
	styleUrls: ['./disenchanting.component.css', '../auctions/auctions.component.css']
})
export class DisenchantingComponent implements OnInit {
	copperToString = copperToString;
	getIcon = getIcon;
	isAtAH = isAtAH;
	user = user;
	getAuctionItem = getAuctionItem;
	getMinPrice = getMinPrice;

	isCrafting = false;
	/**
	 * Item quality:
	 * 1 = Gray
	 * 2 = Green
	 * 3 = Blue
	 * 4 = Epic
	 * 5 = Legendary
	 */
	items = [];
	recipes = [];
	onlyProfitable = false;
	itemQuality = {
		1: 'Gray',
		2: 'Green',
		3: 'Blue',
		4: 'Epic',
		5: 'Legendary'
	};
	selected = 0;
	materials = [
		// Legion
		{ 'id': 124442, 'quality': 4, 'minILVL': 800, 'maxILVL': 1000, 'yield': { 'iLvL': 1, 'min': 1, 'max': 1 } },
		{ 'id': 124441, 'quality': 3, 'minILVL': 660, 'maxILVL': 900, 'yield': { 'iLvL': 1, 'min': 1, 'max': 1 } },
		{ 'id': 124440, 'quality': 2, 'minILVL': 680, 'maxILVL': 900, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
		// Warlords
		{ 'id': 113588, 'quality': 4, 'minILVL': 630, 'maxILVL': 799, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
		{ 'id': 111245, 'quality': 3, 'minILVL': 505, 'maxILVL': 700, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } },
		{ 'id': 109693, 'quality': 2, 'minILVL': 494, 'maxILVL': 700, 'yield': { 'iLvL': 600, 'min': 2, 'max': 4 } }
	];

	constructor() { }

	ngOnInit() {
		// this.getItems();
		this.applyFilter();
	}

	getDisenchantItem(item) {
		if (item.quality > 3 && item.itemLevel >= 850) {
			item.disenchantsTo = 'En bög';
		} else {
			item.disenchantsTo = 'Kak jävel';
		}
		return item;
	}

	applyFilter(): void {
		if (this.isCrafting) {
			this.applyRecipes();
		} else {
			this.getItems();
		}
	}

	applyRecipes(): void {
		console.log(this.selected);
		this.recipes = [];
		lists.recipes.forEach(recipe => {
			if (lists.items[recipe.itemID] &&
				lists.items[recipe.itemID].quality === this.materials[this.selected].quality &&
				lists.items[recipe.itemID].itemLevel >= this.materials[this.selected].minILVL) {

				if (this.onlyProfitable &&
					(this.getMinPrice(this.materials[this.selected].id + '') - recipe.cost) <= 0) {
					return;
				}
				this.recipes.push(recipe);
			}
		});
		this.recipes.sort((a, b)  => {
			return a.cost - b.cost;
		});
	}

	getItems() {
		this.items = [];
		Object.keys(lists.auctions).map(k => {
			if (lists.items[k] && (lists.items[k].itemClass === '4' || lists.items[k].itemClass === '2') &&
				lists.items[k].itemLevel > 1 && lists.items[k].quality < 5 && lists.items[k].quality > 1) {
					// Checking if matching desiered target item
					if (lists.items[k] &&
						lists.items[k].quality === this.materials[this.selected].quality &&
						lists.items[k].itemLevel >= this.materials[this.selected].minILVL) {

						if (this.onlyProfitable &&
							this.getMinPrice(this.materials[this.selected].id + '')  <= this.getMinPrice(k)) {
							return;
						}
						this.items.push(lists.auctions[k]);
					}
			}
		});

		this.items.sort((a, b)  => {
			return a.buyout - b.buyout;
		});
		/*
		db.table('items')
			.where('itemClass')
			.equals('4')
			.or('itemClass')
			.equals('2')
			.and((item) => {
				item = this.getDisenchantItem(item);
				return item.itemLevel > 1 && item.quality < 5 && item.quality > 1;
			})
			.toArray()
			.then(i => {
				this.items = i;
				i.sort((a, b) => {
					return a.itemLevel > b.itemLevel ? -1 : 1;
				});
			}, e => {
				console.log(e);
			});*/
	}

	getItemName(itemID: string) {
		if (lists.items[itemID]) {
			return lists.items[itemID].name;
		}
		return 'Unknown';
	}
}
