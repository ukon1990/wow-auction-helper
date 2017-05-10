import { Component, OnInit } from '@angular/core';
import { lists, db } from '../../utils/globals';

@Component({
	selector: 'app-disenchanting',
	templateUrl: './disenchanting.component.html',
	styleUrls: ['./disenchanting.component.css']
})
export class DisenchantingComponent implements OnInit {
	/**
	 * Item quality:
	 * 1 = Gray
	 * 2 = Green
	 * 3 = Blue
	 * 4 = Epic
	 * 5 = Legendary
	 */
	items = [];
	itemQuality = {
		1: 'Gray',
		2: 'Green',
		3: 'Blue',
		4: 'Epic',
		5: 'Legendary'
	};

	constructor() { }

	ngOnInit() {
		this.getItems();
	}

	getDisenchantItem(item) {
		if (item.quality > 3 && item.itemLevel >= 850) {
			item.disenchantsTo = 'En bög';
		} else {
			item.disenchantsTo = 'Kak jävel';
		}
		return item;
	}

	getItems() {
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
			});
	}
}
