import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { user, DB_TABLES, API_KEY, db, lists } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';

@Injectable()
export class CharacterService {

	constructor(private http: Http) { }

	getCharacters() {
		return this.http
			.get(`http://www.wah.jonaskf.net/GetCharacterProfession.php?character=${
					localStorage.crafters
				}&realm=${
					user.realm
				}&region=${
					user.region
				}`)
				.map(r => {
					console.log(r.json());
					return r.json();
				}, error => console.log(error));
	}

	getCharacter(character: string, realm: string) {
		return this.http
			.get(`https://${
					user.region
				}.api.battle.net/wow/character/${
					realm
				}/${character}?fields=professions&locale=en_US&apikey=${
					API_KEY
				}`)
			.map( c => {
				console.log(c.json());
				return c.json();
			}, error => {
				console.log(`Failed at downloading recipe data for `, error);
				return {};
			});
	}

}
