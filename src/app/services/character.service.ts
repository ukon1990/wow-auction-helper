import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { user, DB_TABLES, db, lists } from '../utils/globals';
import Dexie from 'dexie';

import 'rxjs/add/operator/map';

@Injectable()
export class CharacterService {

	constructor(private http: Http) { }

	getCharacters() {
		return this.http
			.get(`http://wah.jonaskf.net/GetCharacterProfession.php?character=${localStorage.crafters}&realm=${user.realm}&region=${user.region}`)
				.map(r => {
					console.log(r.json());
					return r.json();
				}, error => console.log(error));
	}

}
