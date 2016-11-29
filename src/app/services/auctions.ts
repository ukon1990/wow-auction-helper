import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Auction } from '../types/auction';

import 'rxjs/add/operator/map';

@Injectable()
export class AuctionService{
  constructor(private http: Http){}

  getAuctions(){
    return this.http.get('http://www.wah.jonaskf.net/GetAuctions.php?region=eu&realm=emerald-dream')
      .map(response => <Auction>function(r){ console.log('Loaded auctions');return r;  }(response.json()));
  }
  getItems(){
      //http://wah.jonaskf.net/GetItems.php
      return this.http.get('http://wah.jonaskf.net/GetItems.php')
        .map(response => <Object>function(r){ console.log('Loaded items');return r;  }(response.json().items));
  }
}
