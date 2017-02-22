import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

@Injectable()
export class RealmService {
	constructor(private http: Http) { }

	getRealms() {
		return this.http.get('/assets/realmList.json')
		.map(response => response.json(), error => console.log(error));
	}
}
