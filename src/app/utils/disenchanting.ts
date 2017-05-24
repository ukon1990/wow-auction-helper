import { lists, getMinPrice } from './globals';

export class Disenchanting {
	disenchantables;
	onlyProfitable = false;
	isCrafting = false;
	itemQuality = {
		1: 'Gray',
		2: 'Green',
		3: 'Blue',
		4: 'Epic',
		5: 'Legendary'
	};
		bonusListMods = {
		3408: {
			'ilvl': -110,
			'quality': -1
		}
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

	constructor(isCrafting) {
		this.isCrafting = isCrafting;
	}

	applyFilter() {
		if (this.isCrafting) {
			this.applyRecipes();
		} else {
			this.applyItems();
		}
	}

	isDisenchantable(itemID: string): boolean {
		return false;
	}

	applyRecipes(): void {
		console.log(this.selected);
		this.disenchantables = [];
		lists.recipes.forEach(recipe => {
			if (lists.items[recipe.itemID] &&
				lists.items[recipe.itemID].quality === this.materials[this.selected].quality &&
				lists.items[recipe.itemID].itemLevel >= this.materials[this.selected].minILVL) {

				if (this.onlyProfitable &&
					(getMinPrice(this.materials[this.selected].id + '') - recipe.cost) <= 0) {
					return;
				}
				this.disenchantables.push(recipe);
			}
		});
		this.disenchantables.sort((a, b)  => {
			return a.cost - b.cost;
		});
	}

	applyItems() {
		console.log('The type=' + (typeof this.materials[this.selected].quality) + ' ' + this.materials[this.selected].quality);
		this.disenchantables = [];
		Object.keys(lists.auctions).map(k => {
			if (lists.items[k] && (lists.items[k].itemClass === '4' || lists.items[k].itemClass === '2') &&
				lists.items[k].itemLevel > 1) {
					// Checking if matching desiered target item
					if (k === '121023') {
						console.log(lists.items[k]);
						console.log(lists.auctions[k]);
					}
					if (lists.items[k] &&
						lists.items[k].quality === this.materials[this.selected].quality &&
						lists.items[k].itemLevel >= this.materials[this.selected].minILVL) {

						if (this.onlyProfitable &&
							getMinPrice(this.materials[this.selected].id + '')  <= getMinPrice(k)) {
							return;
						}
						console.log(lists.auctions[k]);
						this.disenchantables.push(lists.auctions[k]);
					}
			}
		});

		this.disenchantables.sort((a, b)  => {
			return a.buyout - b.buyout;
		});
	}

	getItemName(itemID: string) {
		if (lists.items[itemID]) {
			return lists.items[itemID].name;
		}
		return 'Unknown';
	}
}
