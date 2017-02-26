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
	constructor() { }

	ngOnInit() {
		 console.log(this.getItem(127846));
	}

	getItem(itemID) {
		try {
			return lists.items[itemID];
		} catch (err) {
			return 'loading';
		}
	}

	goldConversion = copperToArray;
}