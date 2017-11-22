import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { lists } from '../../utils/globals';
import { Item } from '../../utils/item';

@Component({
	selector: 'app-autocomplete',
	templateUrl: './autocomplete.component.html',
	styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent {
	itemCtrl: FormControl;
	filteredStates: Observable<any[]>;
	@Input() title: string;
	@Input() type: string;
	@Output() item = new EventEmitter;
	@Output() name = new EventEmitter;
	getIcon = Item.getIcon;

	constructor() {
		this.itemCtrl = new FormControl();
		this.filteredStates = this.itemCtrl.valueChanges
			.startWith(null)
			.map(name => {
				this.emitName(name ? name : '');
				return name ? ( this.type === 'recipe' ? this.filterRecipes(name) : this.filterItems(name) ).slice(0, 20) : [];
			});
	}

	filterItems(name: string) {
		return lists.itemsArray.filter(item =>
			item.name.toLowerCase().indexOf(name.toLowerCase()) > -1);
	}

	filterRecipes(name: string) {
		return lists.recipes.filter(recipe =>
			recipe.name.toLowerCase().indexOf(name.toLowerCase()) > -1);
	}

	selectItem(item: Item): void {
		// this.item.emit(item);
	}

	emitName(name: string): void {
		this.name.emit(name);
	}
	emitItemByName(): void {}
}
