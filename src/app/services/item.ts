import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { IAuction, IPet, IUser, IItem } from '../utils/interfaces';
import { user, DB_TABLES, db } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';

declare var $: any;

@Injectable()
export class ItemService {
	constructor(private http: Http, private httpClient: HttpClient) { }

	getItem(itemid: string) {
		return this.http.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemid)
			.map(response => <Object>function(r) {
				if (r.itemID !== undefined) {
					try {
						db.table('items').put(r).catch(c => {
							console.log(c);
						});
					} catch (err) {
						console.log('Unable to add item to db', err);
					}
				}
				return r;
			} (response.json()),
			error => console.log(error));
	}

	getItemWowDB(itemID: string) {
		return this.httpClient.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemID + '&wowdb=1').toPromise();
	}

	getPet(petSpeciesId: string) {
		return this.httpClient.get('http://wah.jonaskf.net/GetSpecies.php?speciesId=' + petSpeciesId)
			.map(response => <Object>function(r) {
				db.table('pets').put(r);
				return r;
			} (response));
	}

	getItems() {
		const apiUrl = 'http://wah.jonaskf.net/GetItems.php',
			localUrl = '/assets/GetItems.json';

		return this.httpClient.get(this.getUrl(apiUrl, localUrl))
			.map(response => <Object>function(r) {
				db['items'].clear();
				db['items'].bulkAdd(r);
				localStorage.setItem('timestamp_items', new Date().toDateString());
				console.log('Item download completed');
				return r;
			} (response['items']));
	}

	getPets() {
		console.log('Loading pets');
		const apiUrl = 'http://wah.jonaskf.net/GetSpecies.php',
			localUrl = '/assets/GetSpecies.json';

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(response => <Object>function(r) {
				console.log('Loaded pets');
				db.table('pets').bulkPut(r);
				return r;
			} (response.json().pets));
	}

	getRecipeByItem(itemID): any {
		console.log('Downloaded recipe for item ' + itemID);
		const localUrl = '/assets/GetRecipe.json',
			apiUrl = 'http://wah.jonaskf.net/GetRecipe.php?itemid=' + itemID;

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(r => {
				return r.json();
			}, error => console.log(error));
	}

	getRecipeBySpell(spellID): any {
		console.log('Downloaded recipe for spell ' + spellID);
		const localUrl = '/assets/GetRecipe.json',
			apiUrl = 'http://wah.jonaskf.net/GetRecipe.php?spellId=' + spellID;

		return this.http.get(this.getUrl(apiUrl, localUrl))
			.map(r => {
				return r.json();
			}, error => console.log(error));
	}

	getRecipes(): Promise<any> {
		console.log('Loaded recipes');
		const localUrl = '/assets/GetRecipe.json',
			apiUrl = 'http://wah.jonaskf.net/GetRecipe.php';

		return this.httpClient.get(
			this.getUrl(apiUrl, localUrl)).toPromise();
	}

	recipeFromXML(r, itemID): Object {
		const createdBySpells = $(r['_body']).find('createdBy').find('spell'),
			recipeObject = {};
		for (let i = 0, x = createdBySpells.length; i < x; i++) {
			const spell = $(createdBySpells[i])[i], spellElement = $(spell)[0],
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
		if (window.location.hostname === 'localhost') {
			console.log('Using local files');
		}

		return window.location.hostname === 'localhost' ? localUrl : apiUrl;
	};
}
