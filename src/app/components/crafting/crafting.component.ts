import { Component } from '@angular/core';
import { user, itemClasses, lists, copperToArray, getPet } from '../../utils/globals';

@Component({
	selector: 'crafting',
	templateUrl: 'crafting.component.html'
})
export class CraftingComponent {

	private crafts = [
		// Alchemy
		{
			spellID: 188334,
			itemID: 127846,
			professionId: 171,
			expansionId: 6,
			rank: 2,
			cost: 0,
			buyout: 0,
			profit: 0,
			materials: [{
				itemID: 124105,
				quantity: 2
			}, {
				itemID: 124101,
				quantity: 4
			}, {
				itemID: 124102,
				quantity: 4
			}
			]
		}, {
			spellID: 188325,
			itemID: 127843,
			professionId: 171,
			expansionId: 6,
			rank: 2,
			cost: 0,
			buyout: 0,
			profit: 0,
			materials: [{
				itemID: 124105,
				quantity: 2
			}, {
				itemID: 124104,
				quantity: 4
			}, {
				itemID: 124102,
				quantity: 4
			}
			]
		},
		// Enchanting
		{
			spellID: 191021,
			itemID: 128549,
			professionId: 333,
			expansionId: 6,
			rank: 3,
			cost: 0,
			buyout: 0,
			profit: 0,
			materials: [{
				itemID: 124442,
				quantity: 8
			}, {
				itemID: 124440,
				quantity: 20
			}, {
				itemID: 124124,
				quantity: 1
			}
			]
		}
	];

	private limit: number = 10;// per page
	private index: number = 0;
	private currentPage: number = 1;
	private numOfPages: number = this.crafts.length / this.limit;

	setCrafts() {
		this.crafts = lists.recipes;
		this.numOfPages = this.crafts.length / this.limit;
	}

	private professions = {
		129: 'First Aid',
		164: 'Blacksmithing',
		165: 'Leatherworking',
		171: 'Alchemy',
		185: 'Cooking',
		186: 'Mining',
		197: 'Tailoring',
		202: 'Engineering',
		333: 'Enchanting',
		755: 'Jewelcrafting',
		773: 'Inscription'
	};
	private expansions = {
		0: 'Classic',
		1: 'The burning crusade',
		2: 'Wrath of the Lich King',
		3: 'Cataclysm',
		4: 'Mists of Pandaria',
		5: 'Warlords of Draenor',
		6: 'Legion'
	};

	constructor() { }

	ngOnInit() {
		try {
			this.setCrafts();
		} catch (e) {
			console.log(e);
		}
	}

	getItem(itemID) {
		try {
			return lists.auctions[itemID];
		} catch (err) {
			console.log(err);
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

	getAuctionItem(itemID) {
		return lists.auctions[itemID];
	}

	goldConversion = copperToArray;


	changePage(change: number): void {
		console.log(change, this.currentPage, this.numOfPages);
		if (change > 0 && this.currentPage <= this.numOfPages) {
			this.currentPage++;
		} else if (change < 0 && this.currentPage > 1) {
			this.currentPage--;
		}
	}
}