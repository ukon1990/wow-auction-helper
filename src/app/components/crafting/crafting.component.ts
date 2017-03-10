import { Component } from '@angular/core';
import { user, itemClasses, lists, copperToArray , getPet } from '../../utils/globals';

@Component({
	selector: 'crafting',
	templateUrl: 'crafting.component.html'
})
export class CraftingComponent {
	private crafts = [{
		spellID: 188334,
		itemID: 127846,
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
	}];
	constructor() {}

	ngOnInit() {
		try {
			this.getCraftingCosts();
		} catch (e){
			console.log(e);
		}
		// console.log(this.getItem(127846));
	}

	getItem(itemID) {
		try {
			console.log('itemID=' + itemID);
			console.log(lists.items[itemID]);
			return lists.items[itemID];
		} catch (err) {
			console.log('itemID=' + itemID);
			console.log(err);
			return 'loading';
		}
	}

	getMinPrice(itemID) {
		try {
			return this.goldConversion(lists.auctions[itemID].buyout / lists.auctions[itemID].buyout);
		} catch (e) {
			return '0g 0s 0c';
		}
	}

	getCraftingCosts(): void {
		this.crafts.forEach(c => {
			c.buyout = (lists.auctions[c.itemID].buyout / lists.auctions[c.itemID].quantity);

			c.materials.forEach(m => {
				c.cost += m.quantity * (lists.auctions[m.itemID].buyout / lists.auctions[m.itemID].quantity);
			});
			c.profit = c.buyout - c.cost;
		});
	}

	goldConversion = copperToArray;
}