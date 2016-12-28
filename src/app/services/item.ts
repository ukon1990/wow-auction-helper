import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../utils/types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class ItemService {
  constructor(private http: Http){ }

  getItem(itemid: string) {
    return this.http.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemid)
      .map(response => <Object>function(r){ return r;  }(response.json()));
  }
  getPet(petSpeciesId: string) {
    return this.http.get('http://wah.jonaskf.net/GetSpecies.php?speciesId=' + petSpeciesId )// TODO: Add API call to API https://eu.api.battle.net/wow/pet/species/123456789?locale=en_GB&apikey=5+6546546456456546456
      .map(response => <Object> function(r){return r;}(response.json()));
  }

  getItems() {
      return this.http.get('http://wah.jonaskf.net/GetItems.php')
        .map(response => <Object>function(r){ console.log('Loaded items'); return r;  }(response.json().items));
  }

  getPets() {
    console.log('Loading pets');
    return this.http.get('http://wah.jonaskf.net/GetSpecies.php')
      .map(response => <Object> function(r){console.log('Loaded pets'); return r;}(response.json()));
  }
}
