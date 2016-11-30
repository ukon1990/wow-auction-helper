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
}
