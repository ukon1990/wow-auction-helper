import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { IAuction, IPet, IUser, IItem } from '../utils/interfaces';

import 'rxjs/add/operator/map';

@Injectable()
export class ItemService {
    constructor(private http: Http) { }

    getItem(itemid: string) {
        console.log(itemid);
        return this.http.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemid)
            .map(response => <Object>function(r) { return r; } (response.json()), error => console.log(error));
    }
    getPet(petSpeciesId: string) {
        return this.http.get('http://wah.jonaskf.net/GetSpecies.php?speciesId=' + petSpeciesId)
            .map(response => <Object>function(r) { return r; } (response.json()));
    }

    getItems() {
        return this.http.get('http://wah.jonaskf.net/GetItems.php')
            .map(response => <Object>function(r) { console.log('Loaded items'); return r; } (response.json().items));
    }

    getPets() {
        console.log('Loading pets');
        return this.http.get('http://wah.jonaskf.net/GetSpecies.php')
            .map(response => <Object>function(r) { console.log('Loaded pets'); return r; } (response.json()));
    }
}
