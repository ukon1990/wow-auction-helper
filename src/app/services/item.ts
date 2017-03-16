import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { IAuction, IPet, IUser, IItem } from '../utils/interfaces';

import 'rxjs/add/operator/map';

declare var $: any;

@Injectable()
export class ItemService {
	constructor(private http: Http) { }

	getItem(itemid: string) {
		console.log(itemid);
		return this.http.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemid)
			.map(response => <Object>function (r) { return r; }(response.json()), error => console.log(error));
	}
	getPet(petSpeciesId: string) {
		return this.http.get('http://wah.jonaskf.net/GetSpecies.php?speciesId=' + petSpeciesId)
			.map(response => <Object>function (r) { return r; }(response.json()));
	}

	getItems() {
		let apiUrl = 'http://wah.jonaskf.net/GetItems.php',
			localUrl = '/assets/GetItems.json';
		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(response => <Object>function (r) { console.log('Loaded items'); return r; }(response.json().items));
	}

	getPets() {
		console.log('Loading pets');
		let apiUrl = 'http://wah.jonaskf.net/GetSpecies.php',
			localUrl = '/assets/GetSpecies.json';

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(response => <Object>function (r) { console.log('Loaded pets'); return r; }(response.json()));
	}

	getRecipe(itemID): any {
		console.log('Downloaded recipe for item ' + itemID);
		let localUrl = '/assets/GetRecipe.json',
			apiUrl = 'http://wah.jonaskf.net/GetRecipe.php?itemid=' + itemID;

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(r => {
				return r.json();
			}, error => console.log(error));
	}

	getRecipes(): any {
		console.log('Loaded recipes');
		let localUrl = '/assets/GetRecipe.json',
			apiUrl = 'http://wah.jonaskf.net/GetRecipe.php';

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(r => {
				return r.json();
			}, error => console.log(error));
	}

	recipeFromXML(r, itemID): Object {
		let createdBySpells = $(r['_body']).find('createdBy').find('spell'),
			recipeObject = {};
		for (let i = 0, x = createdBySpells.length; i < x; i++) {
			let spell = $(createdBySpells[i])[i], spellElement = $(spell)[0],
				reagents = $(createdBySpells[0]).find('reagent');
			recipeObject['spellID'] = parseInt(spell.id, 10);
			recipeObject['itemID'] = itemID;
			recipeObject['name'] = spellElement.attributes['name'].nodeValue;
			recipeObject['minCount'] = spellElement.attributes['mincount'].nodeValue;
			recipeObject['maxcount'] = spellElement.attributes['maxcount'].nodeValue;
			recipeObject['reagents'] = [];
			for (let ir = 0, xr = reagents.length; ir < xr; ir++) {
				// nodemap {0: id, 1: name, 2: quality, 3: icon, 4: count, length: 5}
				recipeObject['reagents'].push({
					'id': parseInt(reagents[ir].attributes['id'].nodeValue, 10),
					'name': reagents[ir].attributes['name'].nodeValue,
					'quantity': parseInt(reagents[ir].attributes['count'].nodeValue, 10)
				});
			}

		}
		return recipeObject;
	}

	getUrl(apiUrl, localUrl) {
		if(window.location.hostname === 'localhost') {
			console.log('Using local files');
		}

		return window.location.hostname === 'localhost' ? localUrl : apiUrl;
	};
}
