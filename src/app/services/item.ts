import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class ItemService{
  constructor(private http: Http){}

  getItem(itemid){
    return this.http.get('http://localhost:8888/wow-api-layer/GetItems.php?itemid=' + itemid)
      .map(response => <Auction>function(r){  console.log(r); return r;  }(response.json()));
  }
}
