import { Component, OnInit } from '@angular/core';
import { lists } from '../../utils/globals';
import { Item } from '../../utils/item';
import { Event } from '@angular/router';

/**
 * This is a component designed for milling and prospecting.
 */
@Component({
	selector: 'app-shuffle',
	templateUrl: './shuffle.component.html'
})
export class ShuffleComponent implements OnInit {
	itemSearchQuery = '';
	itemName: string;

	constructor() { }

	ngOnInit() {
		// s
	}

	itemSearch(): Item[] {
		console.log(this.itemSearchQuery);
		if (this.itemSearchQuery.length === 0) {
			return [];
		}
		return Object.keys(lists.items)
			.filter(i => {
				if (lists.items[i].name.toLowerCase().indexOf(this.itemSearchQuery.toLowerCase()) > -1) {
					return lists.items[i];
				}
			});
	}

	getItemName(id: string): string {
		return lists.items[id].name;
	}

	recieveName(event): void {
		console.log(event);
		this.itemName = event;
	}
}

class Shuffle {
	targetId: string;
	shuffles: ShuffleItem[];
}

class ShuffleItem {
	itemId: string;
	dropChance: number;
}
