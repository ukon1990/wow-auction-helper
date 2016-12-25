import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../utils/types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class ItemService{
  constructor(private http: Http){}

  getItem(itemid){
    return this.http.get('http://wah.jonaskf.net/GetItems.php?itemid=' + itemid)
      .map(response => <Object>function(r){ return r;  }(response.json()));
  }
  getItems(){
      //http://wah.jonaskf.net/GetItems.php
      return this.http.get('http://wah.jonaskf.net/GetItems.php')
        .map(response => <Object>function(r){ console.log('Loaded items'); return r;  }(response.json().items));
  }
}
